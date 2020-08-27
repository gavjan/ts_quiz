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
function format_spent_seconds(seconds: number) {
    let date = new Date(seconds * 1000);
    let hh = date.getUTCHours();
    let mm = date.getUTCMinutes();
    let ss = date.getSeconds();

    let hour="";
    let minute="";
    let second;

    if(hh!=0) hour = hh + "h ";
    if(mm!=0) minute = mm +"m ";
    second = ss + "s";

    return hour+minute+second;

}
let result = {
    "score": -1,
    "detailed": false,
    "details": {}
};

let answers_str = localStorage.getItem("answers") as string
if(!answers_str)
    location.href = 'index.html'

let answers = JSON.parse(answers_str);
let score = 0;

let saved_results: JSON[] = [];
let saved_results_str = localStorage.getItem("saved_results");



let score_string = ""
for(let i = 0; i < answers.length; i++) {
    let x = answers[i];
    let correct_ans = x["options"][x["choice"]-1] === x["ans"];

    score_string+="Question " + (i+1) + ": ";
    score_string+="[" + format_spent_seconds(x["time_spent"]) + "]";
    let penalty = x["penalty"];
    score_string+=(correct_ans ? " Correct" : " + [" + penalty + "s] mistake") + "<br>";
    score+=x["time_spent"];
    if(!correct_ans)
        score+=x["penalty"];
}

let newDIV = document.createElement("div");
document.body.appendChild(newDIV);
newDIV.innerHTML = "<p class=\"score_text\">" + score_string + "<br>---<br>Total Score: " + format_spent_seconds(score) + "</p>";

if(saved_results_str) {
    saved_results = JSON.parse(saved_results_str);
    let newDIV = document.createElement("div");
    document.body.appendChild(newDIV);
    let ranking_str = "<hr>";
    ranking_str+="<h1 style=\"font-size: 80px; text-align: center\"> Ranking </h1>";
    ranking_str+="<p class=\"ranking_text\">";
    let ranking = [];
    for(let i = 0; i < saved_results.length; i++) {
        let x: any = saved_results[i];
        ranking.push(x.score);
    }
    ranking.sort();
    for(let i = 0; i < ranking.length; i++) {
        ranking_str+= (i+1) + ") " + format_spent_seconds(ranking[i]) + "<br>";
    }
    newDIV.innerHTML=ranking_str;
}
