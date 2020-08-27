"use strict";
function save_detailed_score() {
    result["details"] = answers;
    result["detailed"] = true;
    save_score();
}
function save_score() {
    result["score"] = score;
    saved_results.push(JSON.parse(JSON.stringify(result)));
    localStorage.setItem("saved_results", JSON.stringify(saved_results));
    location.href = "index.html";
}
function format_spent_seconds(seconds) {
    var date = new Date(seconds * 1000);
    var hh = date.getUTCHours();
    var mm = date.getUTCMinutes();
    var ss = date.getSeconds();
    var hour = "";
    var minute = "";
    var second;
    if (hh != 0)
        hour = hh + "h ";
    if (mm != 0)
        minute = mm + "m ";
    second = ss + "s";
    return hour + minute + second;
}
var result = {
    "score": -1,
    "detailed": false,
    "details": {}
};
var answers_str = localStorage.getItem("answers");
if (!answers_str)
    location.href = 'index.html';
var answers = JSON.parse(answers_str);
var score = 0;
var saved_results = [];
var saved_results_str = localStorage.getItem("saved_results");
var score_string = "";
for (var i = 0; i < answers.length; i++) {
    var x = answers[i];
    var correct_ans = x["options"][x["choice"] - 1] === x["ans"];
    score_string += "Question " + (i + 1) + ": ";
    score_string += "[" + format_spent_seconds(x["time_spent"]) + "]";
    var penalty = x["penalty"];
    score_string += (correct_ans ? " Correct" : " + [" + penalty + "s] mistake") + "<br>";
    score += x["time_spent"];
    if (!correct_ans)
        score += x["penalty"];
}
var newDIV = document.createElement("div");
document.body.appendChild(newDIV);
newDIV.innerHTML = "<p class=\"score_text\">" + score_string + "<br>---<br>Total Score: " + format_spent_seconds(score) + "</p>";
if (saved_results_str) {
    saved_results = JSON.parse(saved_results_str);
    var newDIV_1 = document.createElement("div");
    document.body.appendChild(newDIV_1);
    var ranking_str = "<hr>";
    ranking_str += "<h1 style=\"font-size: 80px; text-align: center\"> Ranking </h1>";
    ranking_str += "<p class=\"ranking_text\">";
    var ranking = [];
    for (var i = 0; i < saved_results.length; i++) {
        var x = saved_results[i];
        ranking.push(x.score);
    }
    ranking.sort();
    for (var i = 0; i < ranking.length; i++) {
        ranking_str += (i + 1) + ") " + format_spent_seconds(ranking[i]) + "<br>";
    }
    newDIV_1.innerHTML = ranking_str;
}
