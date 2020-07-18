const url = window.location.pathname
const trackingCode = url.split("/").pop();
var trackingData;


$(function () {
    $.get("/api/tracker/" + trackingCode, function (data, status) {
        trackingData = JSON.parse(data);
        console.log(trackingData);

        //set upper 3 quick stats elements
        let currentEpochSeconds = Date.now() / 1000;
        let daysDifference = Math.floor(Math.abs(currentEpochSeconds - trackingData["created_time"]) / 86400);
        if (daysDifference === 0) {
            daysDifference = 1;
        }
        let viewsPerDay = roundedToFixed(trackingData["visit_counts"]["all"] / daysDifference, 1);
        $("#views-per-day").text(viewsPerDay);
        $("#views").text(trackingData["visit_counts"]["all"]);
        $("#unique-views").text(trackingData["visit_counts"]["unique"]);

        //populate recent view table
        addVisits(trackingData["visits"], false);
        //add event handler for when scroll reached bottom
        $('#recent-visits-container').on("scroll", function() {
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                let amount = 20;
                let start = trackingData["visits_size"] - trackingData["visits"].length - amount;
                if (0 > start) {
                    amount = start + amount;
                    start = 0;
                    $(this).off("scroll");
                }
                $.get(`/api/get_views/${trackingCode}?start=${start}&amount=${amount}`, function (data, status) {
                    let viewsData = JSON.parse(data);
                    console.log(viewsData);
                    addVisits(viewsData["views"], true);
                });
            }
        });


        //create map
        $('#world-map').vectorMap({
            map: 'world_mill_en',
            series: {
                regions: [{
                    values: filterDataForMap(trackingData["visit_counts"]["country_code"], 'world_mill_en'),
                    scale: ['#C8EEFF', '#0071A4'],
                    normalizeFunction: 'polynomial'
                }]
            },
            onRegionTipShow: function (e, el, code) {
                let views = trackingData["visit_counts"]["country_code"][code];
                if (views === undefined) {
                    views = 0;
                }
                el.html(`${el.html()} (${views} views)`);
            }
        });

        //pie chart options
        let options = {
            legend: false,
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        let dataset = data.datasets[tooltipItem.datasetIndex];
                        let meta = dataset._meta[Object.keys(dataset._meta)[0]];
                        let total = meta.total;
                        let currentValue = dataset.data[tooltipItem.index];
                        let percentage = parseFloat((currentValue / total * 100).toFixed(1));
                        return currentValue + ' (' + percentage + '%)';
                    },
                    title: function (tooltipItem, data) {
                        return data.labels[tooltipItem[0].index];
                    }
                }
            }
        }
        let refPieData = {datasets: [{data: [], backgroundColor: randomColor}], labels: []};
        $.each(trackingData["visit_counts"]["referer"], function (key, value) {
            refPieData["labels"].push(key);
            refPieData["datasets"][0]["data"].push(value);
        });
        new Chart($("#country-pie"), {
            type: 'pie',
            data: refPieData,
            options: options
        });
    });
    $(".close").click(function () {
        $(".popup").hide();
        $(".blur-all").removeClass("blur-all");
    });
});

function visitMoreInfo(visitIndex) {
    $("#main-content").addClass("blur-all");
    $("#visit-more-info").show();
    $("#google-map").prop('src', googleMapsSrc(trackingData["visits"][visitIndex]["longitude"], trackingData["visits"][visitIndex]["latitude"]));
    $("#view-more-info tbody").empty();
    $.each(trackingData["visits"][visitIndex], function (key, value) {
        if (value.length !== 0) {
            $("#view-more-info tbody").append(`
                <tr>
                    <td class="datatag-key">${key}</td>
                    <td class="datatag-value">${value}</td>
                </tr>
            `);
        }
    });
    //converts epoch time in time_requested field to human readable format
    let timeField = $(".datatag-key:contains('time_requested')").parent().children(".datatag-value");
    timeField.text(new Date(parseInt(timeField.text()) * 1000).toString())
}

function addVisits(visits, append) {
    $.each(visits, function (index, visit) {
        if (append) {
            trackingData["visits"].push(visit);
            index = trackingData["visits"].length - 1;
        }
        let visitLocation;
        if (visit["city"].length === 0) {
            if (visit["country_name"].length === 0) {
                visitLocation = "(unknown)";
            } else {
                visitLocation = visit["country_name"];
            }
        } else {
            visitLocation = `${visit["city"]}, ${visit["country_name"]}`;
        }
        $("#recent-visits tbody").append(`
                <tr>
                    <td>${visitLocation}</td>
                    <td>${timeSince(new Date(visit["time_requested"] * 1000))}</td>
                    <td><div class="w3-btn green-button" onclick="visitMoreInfo(${index});">More info</div></td>            
                </tr>
            `);
    });
}

function googleMapsSrc(longitude, latitude) {
    return `https://maps.google.com/maps?q=${longitude}, ${latitude}&z=2&output=embed`
}

function filterDataForMap(data, mapName) {
    let filteredData = {};
    $.each(data, function (key, value) {
        //Only add when the key (country code) exists in the map
        if (jvm.Map.maps[mapName].paths[key] !== undefined) {
            filteredData[key] = value;
        }
    });
    return filteredData;
}

function roundedToFixed(_float, _digits) {
    let rounded = Math.pow(10, _digits);
    return (Math.round(_float * rounded) / rounded).toFixed(_digits);
}

function timeSince(timeStamp) {
    var now = new Date(),
        secondsPast = (now.getTime() - timeStamp) / 1000;
    if (secondsPast < 60) {
        return parseInt(secondsPast) + 's';
    }
    if (secondsPast < 3600) {
        return parseInt(secondsPast / 60) + 'm';
    }
    if (secondsPast <= 86400) {
        return parseInt(secondsPast / 3600) + 'h';
    }
    if (secondsPast > 86400) {
        day = timeStamp.getDate();
        month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ", "");
        year = timeStamp.getFullYear() == now.getFullYear() ? "" : " " + timeStamp.getFullYear();
        return day + " " + month + year;
    }
}

function randomColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + "," + .6 + ")";

}