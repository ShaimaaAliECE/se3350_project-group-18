const express = require('express');
const cookieParser = require('cookie-parser');
const newConnection = require('./DBConnection');
const app = express();

app.use(express.static('static'));
app.use(express.static('admin'));
app.use(express.static('jsav'));

app.use(cookieParser());



class Instruction {
    static step0 = new Instruction('Starting Array', 0);
    static step1 = new Instruction('This is our initial, unsorted array', 1);
    static step2 = new Instruction('Split the arrays into two equal lengths, these are the two subarrays', 2);
    static step3 = new Instruction('Now select the left subarray', 3);
    static step4 = new Instruction('Now select the right subarray', 4);
    static step5 = new Instruction('This subrray is fully broken down, so it is ready to merge', 5);
    static step6 = new Instruction('Now that we have sorted the two subarrays, we will merge them into a larger one', 6);
    static step7 = new Instruction('Push the smallest of the two values into the merged array', 7);
    static step8 = new Instruction('If there is only one subarray left, push its remaining values to the merged array', 8);
    static step9 = new Instruction('If both subarrays have values left, compare the values in the first index of each subarray', 9);

    constructor(instruction, stepNo) {
        this.instruction = instruction;
        this.stepNo = stepNo;
    }
}


let arr = [];

function getDisplay(instructionText, ...array) {
    arr.push(instructionText);
    arr.push(array);
}

const _mergeArrays = (a, b) => {
    const c = Array(a.length + b.length);
    let i = 0;
    getDisplay(Instruction.step6, c.toString(), a.toString(), b.toString())

    // If both a and b both have values left, push the smaller of indicies 0 to c
    while (a.length && b.length) {
        getDisplay(Instruction.step9, c.toString(), a.toString(), b.toString())
        c[i++] = a[0] > b[0] ? b.shift() : a.shift();
        getDisplay(Instruction.step7, c.toString(), a.toString(), b.toString())
    }

    //if we still have values, let's add them at the end of `c` (OUTPUT that when one array is empty, just put the other ones back in order)
    while (a.length) {
        c[i++] = a.shift();
        getDisplay(Instruction.step8, c.toString(), a.toString(), b.toString())
    }
    while (b.length) {
        c[i++] = b.shift();
        getDisplay(Instruction.step8, c.toString(), a.toString(), b.toString())
    }

    return c // final OUTPUT as a culmination of 'choices'
}

// a is the first set of numbers we show to the user (OUTPUT)
const mergeSort = (a) => {
    // base case for recursion - if the array only has 1 value, it cannot be split further (OUTPUt that it cannot be split further)
    if (a.length < 2) return a
    getDisplay(Instruction.step1, a.toString())
    // determining where the middle point would be in the array, which is how the two equal lengths will be separated
    const middle = Math.floor(a.length / 2)
    // split the arrays into two equal lengths, these are the two split sets (OUTPUT - show the split subarrays)
    const a_l = a.slice(0, middle)
    const a_r = a.slice(middle, a.length)
    getDisplay(Instruction.step2, a.toString(), a_l.toString(), a_r.toString())

    // recursively merge sort on the left and right subarrays
    getDisplay(Instruction.step3, a.toString(), a_l.toString(), a_r.toString())
    if (a_l.length === 1) getDisplay(Instruction.step5, a.toString(), a_l.toString());
    const sorted_l = mergeSort(a_l)
    getDisplay(Instruction.step4, a.toString(), sorted_l.toString(), a_r.toString())
    if (a_r.length === 1) getDisplay(Instruction.step5, a.toString(), a_r.toString());
    const sorted_r = mergeSort(a_r)
    // when the recursive calls are returned (i.e. array has been split as far as possible), merge the subarrays in sorted order

    return _mergeArrays(sorted_l, sorted_r)
}

// function to create array of random numbers with specified length and number range and run mergesort algorithm
function runAlgo(list, size, range) {
    // declare variable to hold array to be sorted
    //let list = [];
    // loop to fill array of specified length
    for (let i = 0; i < size; i++) {
        // store random number in range in variable "num"
        let num = (Math.floor(Math.random() * range) + 1);
        // checks if the number generated is in the array
        list.push(num);
    }
    // call the merge sort algorithm for the generated list
    mergeSort(list);

}


function checkStudent(username, password, cbSuccess, cbFail){   
    let dbUsername;
    let dbPassword;
    let connection = newConnection();
    connection.connect();

    connection.query(`select * from Users where type='student'`, (err, rows, fields) => {
        if (err) {
            console.log(err);
            cbFail();
        }
        
        let loginList = rows;
        for (l of loginList) {
            dbUsername = l.username;
            dbPassword = l.password;
            if ((dbUsername == username) && (dbPassword == password)) {
                cbSuccess();
                return;
            }
        }
        if ((dbUsername != username) || (dbPassword != password)) {
            cbFail();
        }
    })
}

function checkAdmin(username, password, cbSuccess, cbFail){   
    let connection = newConnection();
    let dbUsername;
    let dbPassword;
    connection.connect();

    connection.query(`select * from Users where type='admin'`, (err, rows, fields) => {
        let loginList = rows;
        for (l of loginList) {
            dbUsername = l.username;
            dbPassword = l.password;
            if ((dbUsername == username) && (dbPassword == password)) {
                cbSuccess();
                return;
            }
        }
        if ((dbUsername != username) || (dbPassword != password)) {
            cbFail();          
        }
    })
}

//let length = 10;
//let max = 20;
//runAlgo(length, max);



app.get('/array', (req, res) => {
    arr = [];
    let content = '';

    let list = [];
    let s = req.query.size;
    let r = req.query.range;
    runAlgo(list, s, r);

    content += list;

    res.send(content);
})



app.get('/array2', (req, res) => {
    res.send(JSON.stringify(arr));
})

app.get('/level1', (req, res) => {
    res.redirect('/index.html')

})

app.get('/level2', (req, res) => {
    res.redirect('/level2.html')

})

app.get('/level3', (req, res) => {
    res.redirect('/level3.html')

})

app.get('/level5', (req, res) => {
    res.redirect('/level5.html')

})

app.get('/menu', (req, res) => {
    res.redirect('/menu.html')

})

app.get('/registerattempt', (req, res) => {
    let username = req.cookies.username;
    let password = req.cookies.password;

    let cbFail = () => {
        res.sendStatus(401);
    }

    let cbSuccess = () => {
        let timestamp = new Date().getTime();
        let level = req.query.level;

        let connection = newConnection();
        connection.connect();

        connection.query(`insert into Activity values("${username}", ${timestamp}, ${level}, null, false)`
            , (err, rows, fields) => {
                if (err)
                    console.log(err);
                else
                    console.log('Registered new attempt');
            })
        res.send(200);
    }

    checkStudent(username, password, cbSuccess, cbFail);
})

app.get('/completeattempt', (req, res) => {
    let username = req.cookies.username;
    let password = req.cookies.password;

    let cbFail = () => {
        res.sendStatus(401);
    }

    let cbSuccess = () => {
        let timestamp = new Date().getTime();
        let success = req.query.success;

        let connection = newConnection();
        connection.connect();

        connection.query(`
            UPDATE Activity 
            SET completiontime = ${timestamp}, success = ${success}
            WHERE username = "${username}"
            ORDER BY timestamp DESC
            LIMIT 1
        `
            , (err, rows, fields) => {
                if (err)
                    console.log(err);
                else
                    console.log('Completed last attempt');
            })
        res.send(200)
    }

    checkStudent(username, password, cbSuccess, cbFail);
})

app.get('/timesdata', (req, res) => {
    let username = req.cookies.username;
    let password = req.cookies.password;

    let cbFail = () => {
        res.sendStatus(401);
    }
    
    let cbSuccess = () => {
        let connection = newConnection();
        connection.connect();
    
        connection.query(`
            SELECT username, level, SUM(completiontime - timestamp) as time
            FROM Activity
            GROUP BY username, level`
        , (err, rows, fields) => {
            res.send(rows)
        });
    }

    checkAdmin(username, password, cbSuccess, cbFail);
})

app.get('/attemptsdata', (req, res) => {
    let username = req.cookies.username;
    let password = req.cookies.password;

    let cbFail = () => {
        res.sendStatus(401);
    }
    
    let cbSuccess = () => {
        let connection = newConnection();
        connection.connect();
    
        connection.query(`
            SELECT username, level, COUNT(level) as attempts
            FROM Activity
            GROUP BY username, level`
        , (err, rows, fields) => {
            res.send(rows)
        });
    }

    checkAdmin(username, password, cbSuccess, cbFail);
})

app.get('/studentLogin', (req, res) => {
    var formUserName = req.query.username;
    let formPassword = req.query.password;

    let cbSuccess = () => {
        res.cookie('username', formUserName);
        res.cookie('password', formPassword);
        res.redirect('algorithmMenu.html');
    }
    
    let cbFail = () => {
        // if the user fails to log in, try to create a new account.
        // first check if the username exists, and if it doesn't, create the account
        // if it does exist, the user may not log in
        let connection = newConnection();
        connection.connect();
    
        connection.query(`select * from Users where type='student'`, (err, rows, fields) => {
            if (err){
                console.log(err);
            }

            else {
                console.log(rows)
                let loginList = rows;
                for (l of loginList) {
                    // check if the username exists
                    if (l.username == formUserName) {
                        console.log('Incorrect password for the given username');
                        res.redirect('login.html');
                        return;
                    }
                }
                connection.query(`INSERT INTO Users VALUES("student", "${formUserName}", "${formPassword}")`,
                (err, rows, fields) => {
                    if (err){
                        console.log(err);
                    }
                    else {
                        console.log('Created new user successfully');
                        cbSuccess();
                    }
                })
            }
        })
        
    }

    checkStudent(formUserName, formPassword, cbSuccess, cbFail);
})

app.get('/adminLogin', (req, res) => {
    let formUserName = req.query.username;
    let formPassword = req.query.password;

    let cbSuccess = () => {
        res.cookie('username', formUserName);
        res.cookie('password', formPassword);
        res.redirect('admin.html');
    }
    let cbFail = () => {
        res.redirect('login.html');
    }

    checkAdmin(formUserName, formPassword, cbSuccess, cbFail);
})

// setting local host listen to 80
app.listen(80);
