const popup_ele = document.getElementById("popup");
const embed_input = document.getElementById("embed-link");
const stats_input = document.getElementById("stats-link");
const embed_button = document.getElementById("embed-copy");
const stats_button = document.getElementById("stats-copy");

function create_popup() {
    popup_ele.style.display = "block";
    embed_input.value = "Loading...";
    stats_input.value = "Loading...";
    embed_button.disabled = true;
    stats_input.disabled = true;
    let trackerRequest = new XMLHttpRequest();
    trackerRequest.onreadystatechange = function () {
        if (trackerRequest.readyState === 4 && trackerRequest.status === 200) {
            let response = JSON.parse(trackerRequest.responseText);
            let tracker_id = response["tracker_id"];
                embed_input.value = `${window.location.origin}/img/${tracker_id}.jpeg`;
                stats_input.value = `${window.location.origin}/img/${tracker_id}`;
                embed_button.disabled = false;
                stats_input.disabled = false;
        }
    }
    trackerRequest.open("GET", "/api/create_tracker");
    trackerRequest.send();
}

function copy_text(input_id) {
    let input = document.getElementById(input_id);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
}