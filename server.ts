import * as fs from 'fs';
import {promisify} from 'util';
import * as sqlite3 from 'sqlite3';
import {sign} from "crypto";

function to_sql_date(date: Date): string {
    return date.toISOString().replace("T", " ").replace(/\.[0-9]{3}Z/g, "");
}
function load_quiz(req, res, quiz_id) {
    let user_name = req.session.username;
    let sql = 'SELECT username FROM answers WHERE username = "' + user_name + '" AND id = ' + quiz_id + ';';
    db.all(sql, [], (err, rows) => {
        if(err) throw(err);

        let username_str: string;
        for(let {username} of rows)
            username_str = username;

        if(username_str == undefined) {
            sql = 'SELECT quiz_json FROM quizzes WHERE id = ' + quiz_id + ';';
            db.all(sql, [], (err, rows) => {
                if(err) throw(err);
                let quiz_json_str: string;
                for(let {quiz_json} of rows)
                    quiz_json_str = quiz_json;
                if(quiz_json_str != undefined) {
                    let questions_json = JSON.parse(quiz_json_str.replace(/'/g, '"'));

                    res.render('quiz', {
                        csrfToken: req.csrfToken(),
                        quiz_json: JSON.stringify(questions_json),
                        quiz_id: quiz_id
                    });

                } else {
                    console.log("Error loading quiz");
                    load_quiz_list(req, res);
                }
            });
        } else
            load_quiz_stat(req, res, quiz_id);


    });


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
function parse_stats(answer_json, questions_avg) {
    let stats_arr = [];
    let num = 0;
    answer_json.forEach(x => {
        num++;
        let question_str = x.question;
        let ans = x.ans;
        let your_ans = x.options[x.choice-1];

        let score = x.time_spent;
        let correct_ans = (x.options[x.choice-1] === x["ans"]);
        if(!correct_ans)
            score+=x.penalty;
        score = format_spent_seconds(score);

        let avg_time = questions_avg[num-1];
        if(avg_time !== "-")
            avg_time = format_spent_seconds(parseInt(avg_time));

        stats_arr.push({
            num: num,
            question_str: question_str,
            ans: ans,
            your_ans: your_ans,
            score: score,
            avg_time: avg_time
        })
    });
    return stats_arr;
}
function count_questions_avg(answer_json_str_arr) {
    let all_ans_times = [];
    answer_json_str_arr.forEach(answer_str => {
        let ans_times = [];
        let answer = JSON.parse(answer_str.replace(/'/g, '"'));
        answer.forEach(x => {
            let correct_ans = (x.options[x.choice-1] === x["ans"]);
            if(correct_ans)
                ans_times.push(x.time_spent);
            else
                ans_times.push(-1);
        });
        all_ans_times.push(ans_times);
    });

    let questions_count = all_ans_times[0].length;
    let questions_avg = [];
    for(let i=0; i < questions_count; i++) {
        let question_avg_array = [];
        for(let j=0; j < all_ans_times.length ; j++) {
            let time = all_ans_times[j][i];
            if(time !== -1)
                question_avg_array.push(time);
        }

        let question_avg = "-";
        if(question_avg_array.length) {
            let questions_sum = 0;
            question_avg_array.forEach(x => questions_sum+=x );
            question_avg = (questions_sum/question_avg_array.length).toString();
        }
        questions_avg.push(question_avg);
    }
    return questions_avg;
}
function load_quiz_stat(req, res, quiz_id) {
    let user_name = req.session.username;
    let sql = 'SELECT answer_json FROM answers WHERE id = ' + quiz_id + ';'
    db.all(sql, [], (err, rows) => {
        if(err) throw(err);
        let answer_json_str_arr: string[] = [];
        for(let {answer_json} of rows)
            answer_json_str_arr.push(answer_json);

        let questions_avg = count_questions_avg(answer_json_str_arr);

        sql = 'SELECT answer_json, score FROM answers WHERE username = "' + user_name + '" AND id = ' + quiz_id + ';'
        db.all(sql, [], (err, rows) => {
            if(err) throw(err);
            let answer_json_str: string;
            let overall_score;
            for(let {answer_json, score} of rows) {
                overall_score = score;
                answer_json_str = answer_json;
            }
            if(answer_json_str != undefined) {
                let answer_json = JSON.parse(answer_json_str.replace(/'/g, '"'));

                sql = 'SELECT username, score FROM answers WHERE id = ' + quiz_id + ' ORDER BY score;';
                db.all(sql, [], (err, rows) => {
                    if(err) throw (err);
                    let top_scores = [];
                    let i = 0;
                    for(let {username, score} of rows) {
                        top_scores.push({username: username, score: score});
                        i++;
                        if(i >= 3)
                            break;
                    }

                    let stats_arr = parse_stats(answer_json, questions_avg);

                    res.render('quiz_stat', {
                        csrfToken: req.csrfToken(),
                        overall_score: format_spent_seconds(overall_score),
                        stats: stats_arr,
                        top_scores: top_scores
                    });
                });


            } else {
                console.log("Error loading quiz stat");
                load_quiz_list(req, res);
            }
        });


    });

}
function load_quiz_list(req, res) {
    let sql = 'SELECT id FROM quizzes;';
    db.all(sql, [], (err, rows) => {
        if(err) throw(err);
        let quiz_id_arr = [];
        for(let {id} of rows)
            quiz_id_arr.push(id);

        res.render('quizzes', {
            csrfToken: req.csrfToken(),
            quizzes: quiz_id_arr
        });
    });
}
function load_sign_in(req, res) {
    req.session.username = undefined;
    req.session.session_key = undefined;
    res.render('sign_in', {
        csrfToken: req.csrfToken(),
    });
}
function load_change_pass(req, res) {
    res.render('change_pass', {
        csrfToken: req.csrfToken(),
    });
}
function signed_in_session(req,res) {
    return new Promise((resolve,reject) => {
        let signed_in = (req.session.username !== undefined);
        if(!signed_in) resolve(false);

        let user = req.session.username;
        let session_key = req.session.session_key;
        let sql = 'SELECT session_key FROM sessions WHERE username = "' + user + '" AND session_key = "' + session_key + '";';
        db.all(sql, [], (err, rows) => {
            if(err) throw(err);
            let session_key_str: string;
            for(let {session_key} of rows)
                session_key_str = session_key;
            signed_in = (session_key_str != undefined);
            resolve(signed_in);
        });
    });
}
function get_random_session_key() {
    return crypto.randomBytes(16).toString('hex');
}
function change_pass(req, res) {
    let new_pass = req.body.new_password;
    let new_pass2 = req.body.new_password2;

    if(new_pass !== new_pass2)
        load_change_pass(req,res);
    else {
        let user = req.session.username;
        let curr_session_key = req.session.session_key;
        db.run('DELETE FROM sessions WHERE username = "' + user + '";',() =>
            db.run('INSERT INTO sessions (username, session_key) VALUES ("' + user + '", "' + curr_session_key + '");', () =>
                db.run('UPDATE users SET password = "' + new_pass + '" WHERE username = "' + user + '";', () =>
                    load_quiz_list(req, res)
                )
            )
        );

    }

}
let open = promisify(fs.open);
let express = require('express');
let server = express();
let cookieParser = require('cookie-parser');
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
let body_parser = require('body-parser');
let session = require('express-session');
let db = new sqlite3.Database('data.db');
let crypto = require("crypto");


server.use(session({secret: "hurrdurr"}));
server.use(body_parser.urlencoded({
    extended: true
}));
server.use(cookieParser());
server.use(csrfProtection);
server.set('view engine', 'pug');

server.get('/quizzes', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in)
            load_quiz_list(req, res);
        else
            load_sign_in(req,res);

    });
});
server.get('/quiz', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in) {
            let url = req.url;
            let regex = /\?quiz_id=\d+\b/;
            if(regex.test(url)) {
                let quiz_id = /\d+/.exec(regex.exec(url)[0])[0];
                load_quiz(req, res,quiz_id);
            }
            else {
                console.log("Wrong quiz query");
                load_quiz_list(req, res);
            }
        }
        else
            load_sign_in(req,res);

    });




});
server.get('/sign_out', function(req, res) {
    let signed_in = (req.session.username !== undefined);
    if(!signed_in)
        load_sign_in(req, res);
    else {
        let user = req.session.username;
        let session_key = req.session.session_key;
        db.run('DELETE FROM sessions WHERE username = "' + user + '" AND session_key = "' + session_key + '";',() =>
            load_sign_in(req, res)
        );
    }
});
server.get('/', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in)
            load_quiz_list(req, res);
        else
            load_sign_in(req,res);

    });
});
server.get('/change_pass', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in)
            load_change_pass(req,res);
        else
            load_sign_in(req,res);
    });
});
server.post('/finish_quiz', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in)
            if(req.body.json_quiz != undefined && req.body.quiz_id != undefined) {
                let answer_json = req.body.json_quiz.replace(/"/g, "'");
                let id = req.body.quiz_id;
                let user_name = req.session.username;
                let score = 0;
                JSON.parse(req.body.json_quiz).forEach(x =>  {
                    score+=x.time_spent;
                    let correct_ans = (x.options[x.choice-1] === x["ans"]);
                    if(!correct_ans)
                        score+=x.penalty;
                });
                db.run('INSERT INTO answers (id, username, score, answer_json ) VALUES (' + id + ', "' + user_name + '", ' + score + ', "' + answer_json +  '");', () =>
                    load_quiz_stat(req, res, id)
                );
            }
            else {
                console.log("Error submitting the quiz");
                load_quiz_list(req, res);
            }
        else
            load_sign_in(req,res);

    });
});
server.post('/sign_in', function(req, res) {
    let signed_in = (req.session.username !== undefined);

    if(!signed_in && req.body.username != "" && req.body.username != undefined) {
        let user = req.body.username;
        let pass = req.body.password;

        let sql = 'SELECT username FROM users WHERE username = "' + user + '" AND password = "' + pass + '";';
        db.all(sql, [], (err, rows) => {
            if(err) throw(err);
            let username_str: string;
            for(let {username} of rows)
                username_str = username;

            if(username_str != undefined) {
                let session_username = req.session.username = req.body.username;
                let session_key = req.session.session_key = get_random_session_key();
                db.run('INSERT INTO sessions (username, session_key) VALUES ("' + session_username + '", "' + session_key + '");',
                    () => res.redirect('/')
                );
            } else
                res.redirect('/');

        });
    } else
        res.redirect('/');

});

server.post('/change_pass', function(req, res) {
    signed_in_session(req,res).then(signed_in => {
        if(signed_in)
            change_pass(req,res);
        else
            load_sign_in(req,res);
    });
});

server.listen(8080);
