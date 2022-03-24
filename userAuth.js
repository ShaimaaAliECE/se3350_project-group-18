const express = require('express');

const newConnection = require('./DBConnection');

const app = express();

app.get('/login', (req,res) => {
    let connection = newConnection();
    let loginList;
    var iType = req.query.type;
    var iUsername = req.query.username;
    var iPassword = req.query.password;
    var dbUsername;
    var dbPassword;
    connection.connect();
    if(iType == 'admin'){
        connection.query(`select * from Users where type='admin'`, (err,rows,fields) => {
            loginList = rows;
            for (l of loginList){
                dbUsername = l.username;
                dbPassword = l.password;
                if((dbUsername == iUsername) && (dbPassword == iPassword)){
                    res.redirect('admin.html'); // Need new redirection
                }
            }
            if((dbUsername != iUsername) || (dbPassword != iPassword)){
                console.log("Invalid username or password");
                // res.redirect('index.html');     // need new redirection
            }            
        })
    }
    else if(iType == 'guest'){
        connection.query(`select * from Users where type='guest'`, (err,rows,fields) => {
            loginList = rows;
            dbUsername = loginList.username;
            dbPassword = loginList.password;
            for (l of loginList){
                dbUsername = l.username;
                dbPassword = l.password;
                if((dbUsername == iUsername) && (dbPassword == iPassword)){
                    // res.redirect('/guest'); // need new redirection
                }
            }
            if((dbUsername != iUsername) || (dbPassword != iPassword)){
                console.log("Invalid username or password");
                // res.redirect('index.html');      // need new redirection
            }       
        })
    }
    else{
        console.log("Invalid User Type");
        // res.redirect('index.html'); // need new redirection
    }     
})