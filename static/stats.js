const url = window.location.pathname
const trackingCode = url.split("/").pop();
var trackingData;


$(function() {
    $.get("/api/tracker/" + trackingCode, function(data, status) {
        trackingData = JSON.parse(data);

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
        let visitsDisplayAmount = 5;
        for (let visitIndex=Math.max(0, trackingData["visits"].length-visitsDisplayAmount); visitIndex < trackingData["visits"].length; visitIndex++) {
            let visitLocation;
            if (trackingData["visits"][visitIndex]["city"].length === 0) {
                if (trackingData["visits"][visitIndex]["country_name"].length === 0){
                    visitLocation = "(unknown)"
                } else {
                    visitLocation = trackingData["visits"][visitIndex]["country_name"]
                }
            } else {
                visitLocation = `${trackingData["visits"][visitIndex]["city"]}, ${trackingData["visits"][visitIndex]["country_name"]}`
            }
            $("#recent-visits tbody").append(`
                <tr>
                    <td>${visitLocation}</td>
                    <td>${timeSince(trackingData["visits"][visitIndex]["time_requested"]*1000)}</td>
                    <td><div class="w3-btn green-button" onclick="visitMoreInfo(${visitIndex});">More info</div></td>            
                </tr>
            `)
        }
        if (trackingData["visits"].length > visitsDisplayAmount) {
            $("#recent-visits tbody").append(`
                <tr>
                    <td></td><td></td>
                    <td><div class="w3-btn green-button" onclick="viewMoreVisits();">View more</div></td>
                </tr>
            `)
        }

        //create map
        $('#world-map').vectorMap({
            map: 'world_mill_en',
            series: {
                regions: [{
                values: filterDataForMap(trackingData["visit_counts"]["country_code"], 'world_mill_en'),
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial'}]},
            onRegionTipShow: function(e, el, code) {
                let views = trackingData["visit_counts"]["country_code"][code];
                if (views === undefined) {
                    views = 0;
                }
                el.html(`${el.html()} (${views} views)`);
            }
        });
    });
    $(".close").click(function() {
        $(".popup").hide();
        $(".blur-all").removeClass("blur-all");
    });
});

function visitMoreInfo(visitIndex) {
    $("#main-content").addClass("blur-all");
    $("#visit-more-info").show();
    $("#google-map").prop('src', googleMapsSrc(trackingData["visits"][visitIndex]["longitude"], trackingData["visits"][visitIndex]["latitude"]));
    $("#view-more-info tbody").empty();
    $.each(trackingData["visits"][visitIndex], function(key, value) {
        $("#view-more-info tbody").append(`
            <tr>
                <td>${key}</td>
                <td>${value}</td>
            </tr>
        `);
    })
}

function viewMoreVisits() {
    console.log(trackingData["visits"]);
}

function googleMapsSrc(longitude, latitude) {
    return `https://maps.google.com/maps?q=${longitude}, ${latitude}&z=2&output=embed`
}

function filterDataForMap(data, mapName){
    let filteredData = {};
    $.each(data,function(key, value){
       //Only add when the key (country code) exists in the map
       if(jvm.Map.maps[mapName].paths[key]!==undefined) {
          filteredData[key] = value;
       }
    });
    return filteredData;
}

function roundedToFixed(_float, _digits){
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
