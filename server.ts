import * as fs from 'fs';
import {promisify} from 'util';
import * as sqlite3 from 'sqlite3';

let questions_json = [
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
]

function to_sql_date(date: Date): string {
    return date.toISOString().replace("T", " ").replace(/\.[0-9]{3}Z/g, "");
}

function load_home_page(req, res) {
    res.render('quiz', {
        quiz_json: JSON.stringify(questions_json),
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

server.use(session({secret: "hurrdurr"}));
server.use(body_parser.urlencoded({
    extended: true
}));
server.use(cookieParser());
server.use(csrfProtection);
server.set('view engine', 'pug');

server.get('/', function(req, res) {
    load_home_page(req, res);
});

//make_db();
//add_memes();

server.listen(8080);
