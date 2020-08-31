import * as sqlite3 from 'sqlite3';

function make_db() {
    let db = new sqlite3.Database('data.db');
    let quizzes_json = [
        {
            id: 1,
            questions: [
                {
                    question: "12-3",
                    options: [10, 11, 8],
                    ans: 9,
                    choice: 0,
                    time_spent: 0,
                    penalty: 5
                }, {
                    question: "12*3",
                    options: [46, 15, 33],
                    ans: 36,
                    choice: 0,
                    time_spent: 0,
                    penalty: 10
                }
            ]
        },{
            id: 2,
            questions: [
                {
                    question: "6+9",
                    options: [16, 13, 17],
                    ans: 15,
                    choice: 0,
                    time_spent: 0,
                    penalty: 5
                }, {
                    question: "6*8",
                    options: [36, 64, 56],
                    ans: 48,
                    choice: 0,
                    time_spent: 0,
                    penalty: 10
                }, {
                    question: "((3*4)-1)*3",
                    options: [11, 48, 24],
                    ans: 33,
                    choice: 0,
                    time_spent: 0,
                    penalty: 15
                }
            ]
        }, {
            id: 3,
            questions: [
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
        }
    ];
    db.run('CREATE TABLE quizzes (' +
        'id INT,' +
        'quiz_json VARCHAR(4096));'
    );
    db.run('CREATE TABLE answers (' +
        'username VARCHAR(36),' +
        'answer_json, VARCHAR(4096)' +
        'id INT);'
    );
    db.run('CREATE TABLE users (' +
        'username VARCHAR(36),' +
        'password VARCHAR(36));'
    );


    db.run('INSERT INTO users (username, password) VALUES ("user1", "user1");');
    db.run('INSERT INTO users (username, password) VALUES ("user2", "user2");');
    quizzes_json.forEach(x =>
        db.run('INSERT INTO quizzes (id, quiz_json) VALUES (' + x.id + ', "' + JSON.stringify(x.questions) + '");'));
    db.close();
}
