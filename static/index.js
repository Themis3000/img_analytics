$(function () {
    $(".close").click(function() {
        $(".popup").hide();
        $(".blur-all").removeClass("blur-all");
    });
});

function createTrackingPopup() {
    $("body > *:not(#popup)").addClass("blur-all");
    $("#popup").show();
    $("#embed-link").text("Loading...");
    $("#stats-link").text("Loading...");
    $("#embed-copy").prop("disabled", true);
    $("#stats-copy").prop("disabled", true);
    $.get("/api/create_tracker", function (data, status) {
        let response = JSON.parse(data);
        let tracker_id = response["tracker_id"];
        $("#embed-link").prop("value", `${window.location.origin}/img/${tracker_id}.jpeg`);
        $("#stats-link").prop("value", `${window.location.origin}/img/${tracker_id}`);
        $("#embed-copy").prop("disabled", false);
        $("#stats-copy").prop("disabled", false);
    })
}

function copy_text(input_id) {
    let input = document.getElementById(input_id);
    input.disabled = false;
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    input.disabled = true;
}