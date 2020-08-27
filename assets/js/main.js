"use strict";
var questions = [
    {
        question: "9+7",
        options: [15, 13, 17],
        ans: 16,
        choice: 0,
        time_spent: 0,
        penalty: 5
    }, {
        question: "4*6",
        options: [22, 12, 23],
        ans: 24,
        choice: 0,
        time_spent: 0,
        penalty: 10
    }, {
        question: "9*8",
        options: [81, 98, 64],
        ans: 72,
        choice: 0,
        time_spent: 0,
        penalty: 10
    }, {
        question: "(9+6)*6",
        options: [84, 81, 96],
        ans: 90,
        choice: 0,
        time_spent: 0,
        penalty: 15
    }, {
        question: "((9*9)-1)/2",
        options: [20, 24, 48],
        ans: 40,
        choice: 0,
        time_spent: 0,
        penalty: 15
    }
];
var curr_question = 0;
var ready_to_finish = false;
function shuffle_questions() {
    questions.forEach(function (x) {
        x["options"].push(x["ans"]);
        shuffle_arr(x["options"]);
    });
}
function make_radio(id) {
    var radio = document.createElement('input');
    radio.setAttribute('type', 'radio');
    radio.setAttribute('name', "pick");
    radio.classList.add("radio_button");
    radio.setAttribute('id', id);
    return radio;
}
function shuffle_arr(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var rand = Math.floor(Math.random() * (i + 1));
        _a = [array[rand], array[i]], array[i] = _a[0], array[rand] = _a[1];
    }
}
function select_option(i) {
    questions[curr_question]["choice"] = i + 1;
    if (!ready_to_finish) {
        var finished = true;
        for (var i_1 = 0; i_1 < questions.length; i_1++) {
            if (questions[i_1]["choice"] === 0) {
                finished = false;
                break;
            }
        }
        if (finished) {
            ready_to_finish = true;
            var finish_button = document.getElementById("finish_button");
            finish_button.classList.remove("inactive_button");
            finish_button.classList.add("active_button");
        }
    }
}
function load_question(q) {
    var question_text = document.getElementById("quiz_question");
    var penalty_text = document.getElementById("penalty_text");
    var curr_page = document.getElementById("curr_page");
    question_text.innerHTML = q["question"] + " = ?";
    curr_page.innerHTML = "Question " + (curr_question + 1) + "/" + questions.length;
    penalty_text.innerHTML = "Wrong answer: +" + q["penalty"] + "s";
    var option_elems = [];
    for (var i = 1; i <= 4; i++)
        option_elems.push(document.getElementById("option" + i));
    var options = q["options"];
    for (var i = 0; i < 4; i++)
        option_elems[i].innerHTML = "<label class='text_box'>" + options[i] + "</label>";
    var radios = [];
    var _loop_1 = function (i) {
        var radio = make_radio("option" + (i + 1));
        option_elems[i].prepend(radio);
        radio.onclick = function () { return select_option(i); };
        radios.push(radio);
    };
    for (var i = 0; i < 4; i++) {
        _loop_1(i);
    }
    if (q["choice"] != 0)
        radios[q["choice"] - 1].checked = true;
}
function update_page_button() {
    var next_button = document.getElementById("next_question_button");
    var prev_button = document.getElementById("prev_question_button");
    if (next_button.classList.contains('inactive_button')) {
        next_button.classList.remove("inactive_button");
        next_button.classList.add("active_button");
    }
    if (prev_button.classList.contains('inactive_button')) {
        prev_button.classList.remove("inactive_button");
        prev_button.classList.add("active_button");
    }
    if (curr_question === questions.length - 1) {
        next_button.classList.remove("active_button");
        next_button.classList.add("inactive_button");
    }
    else if (curr_question === 0) {
        prev_button.classList.remove("active_button");
        prev_button.classList.add("inactive_button");
    }
}
function finish_quiz() {
    if (ready_to_finish) {
        localStorage.setItem("answers", JSON.stringify(questions));
        location.href = 'results.html';
    }
}
function next_question() {
    if (curr_question < questions.length - 1) {
        curr_question++;
        update_page_button();
        load_question(questions[curr_question]);
    }
}
function prev_question() {
    if (curr_question > 0) {
        curr_question--;
        update_page_button();
        load_question(questions[curr_question]);
    }
}
function format_seconds(seconds) {
    var date = new Date(seconds * 1000);
    var hh = date.getUTCHours();
    var mm = date.getUTCMinutes();
    var ss = date.getSeconds();
    var hour = "";
    var minute;
    var second;
    if (hh < 10 && hh != 0)
        hour = "0" + hh + ":";
    else if (hh > 0)
        hour = hh + ":";
    if (mm < 10)
        minute = "0" + mm;
    else
        minute = mm.toString();
    if (ss < 10)
        second = "0" + ss;
    else
        second = ss.toString();
    return hour + minute + ":" + second;
}
shuffle_questions();
load_question(questions[curr_question]);
var stopwatch_done = false;
var stopwatch = document.getElementById("stopwatch");
var seconds = 0;
var countdown = setInterval(function () {
    seconds++;
    questions[curr_question]["time_spent"]++;
    stopwatch.innerHTML = format_seconds(seconds);
    if (stopwatch_done)
        clearInterval(countdown);
}, 1000);
