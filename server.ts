import * as fs from 'fs';
import {promisify} from 'util';
import * as sqlite3 from 'sqlite3';


function to_sql_date(date: Date): string {
    return date.toISOString().replace("T", " ").replace(/\.[0-9]{3}Z/g, "");
}

function load_quiz(req, res) {
    let quiz_id = 1;
    let sql = 'SELECT quiz_json FROM quizzes WHERE id = ' + quiz_id + ';';
    db.all(sql, [], (err, rows) => {
        if(err) throw(err);
        let quiz_json_str: string;
        for(let {quiz_json} of rows)
            quiz_json_str = quiz_json;
        let questions_json = JSON.parse(quiz_json_str);

        res.render('quiz', {
            csrfToken: req.csrfToken(),
            quiz_json: JSON.stringify(questions_json),
        });
    });

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

server.use(session({secret: "hurrdurr"}));
server.use(body_parser.urlencoded({
    extended: true
}));
server.use(cookieParser());
server.use(csrfProtection);
server.set('view engine', 'pug');

server.get('/', function(req, res) {
    load_quiz(req, res);
});
server.post('/finish_quiz', function(req, res) {
    console.log(req.body.json_quiz);
    load_quiz(req,res);
});

//make_db();
//add_memes();

server.listen(8080);
