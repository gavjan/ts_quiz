let questions = JSON.parse(document.getElementById("quiz_json_str").innerHTML);

let curr_question = 0;
let ready_to_finish = false;
function shuffle_questions() {
    questions.forEach(x => {
        x["options"].push(x["ans"]);
        shuffle_arr(x["options"]);
    });
}
function make_radio(id: string) {
    let radio = document.createElement('input');
    radio.setAttribute('type', 'radio');
    radio.setAttribute('name', "pick");
    radio.classList.add("radio_button");
    radio.setAttribute('id', id);
    return radio
}
function shuffle_arr (array: number[]){
    for (let i = array.length - 1; i > 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        [array[i], array[rand]] = [array[rand], array[i]]
    }
}
function select_option(i: number) {
    questions[curr_question]["choice"] = i+1
    if(!ready_to_finish) {
        let finished = true;
        for(let i = 0; i < questions.length; i++) {
            if (questions[i]["choice"] === 0) {
                finished = false;
                break;
            }
        }
        if(finished) {
            ready_to_finish = true;
            let finish_button = document.getElementById("finish_button") as HTMLElement;
            finish_button.classList.remove("inactive_button");
            finish_button.classList.add("active_button");
        }
    }
}
function load_question(q: any) {
    let question_text = (document.getElementById("quiz_question") as HTMLTextAreaElement);
    let penalty_text = (document.getElementById("penalty_text") as HTMLTextAreaElement);
    let curr_page = (document.getElementById("curr_page") as HTMLTextAreaElement)
    question_text.innerHTML = q["question"] + " = ?";
    curr_page.innerHTML = "Question " + (curr_question+1) + "/" + questions.length;
    penalty_text.innerHTML = "Wrong answer: +" + q["penalty"] + "s";
    let option_elems: HTMLLabelElement[] = [];

    for(let i = 1; i <= 4; i++)
        option_elems.push(document.getElementById("option" + i) as HTMLLabelElement);

    let options = q["options"];

    for(let i = 0; i < 4; i++)
        option_elems[i].innerHTML = "<label class='text_box'>" + options[i] + "</label>"

    let radios: HTMLInputElement[] = [];

    for(let i = 0; i < 4; i++) {
        let radio = make_radio("option" + (i + 1));
        option_elems[i].prepend(radio);
        radio.onclick = () =>  select_option(i);
        radios.push(radio);
    }
    if(q["choice"] != 0)
        radios[q["choice"]-1].checked = true;

}
function update_page_button() {
    let next_button = document.getElementById("next_question_button") as HTMLElement;
    let prev_button = document.getElementById("prev_question_button") as HTMLElement;

    if(next_button.classList.contains('inactive_button')) {
        next_button.classList.remove("inactive_button");
        next_button.classList.add("active_button");
    }
    if(prev_button.classList.contains('inactive_button')) {
        prev_button.classList.remove("inactive_button");
        prev_button.classList.add("active_button");
    }

    if(curr_question === questions.length - 1) {
        next_button.classList.remove("active_button");
        next_button.classList.add("inactive_button");
    }
    else if(curr_question === 0) {
        prev_button.classList.remove("active_button");
        prev_button.classList.add("inactive_button");
    }
}
function finish_quiz() {
    if(ready_to_finish) {
        localStorage.setItem("answers", JSON.stringify(questions));
        location.href = 'results.html';
    }
}
function next_question() {
    if(curr_question<questions.length-1) {
        curr_question++;
        update_page_button();
        load_question(questions[curr_question]);
    }
}
function prev_question() {
    if(curr_question>0) {
        curr_question--;
        update_page_button();
        load_question(questions[curr_question]);
    }
}
function format_seconds(seconds: number) {
    let date = new Date(seconds * 1000);
    let hh = date.getUTCHours();
    let mm = date.getUTCMinutes();
    let ss = date.getSeconds();

    let hour="";
    let minute;
    let second;
    if(hh < 10 && hh!=0) hour = "0" + hh + ":";
    else if(hh>0) hour = hh + ":";

    if(mm < 10) minute = "0" + mm;
    else minute = mm.toString()

    if(ss < 10) second = "0" + ss;
    else second = ss.toString();

    return hour+minute+":"+second;

}
shuffle_questions();
load_question(questions[curr_question]);

let stopwatch_done = false;
let stopwatch = document.getElementById("stopwatch") as HTMLElement;
let seconds = 0;
let countdown = setInterval(function() {
    seconds++;
    questions[curr_question]["time_spent"]++;
    stopwatch.innerHTML = format_seconds(seconds);
    if (stopwatch_done) clearInterval(countdown);
}, 1000);
