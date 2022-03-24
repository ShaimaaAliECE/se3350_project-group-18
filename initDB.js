const express = require('express');
const newConnection = require('./DBConnection');
let connection = newConnection();

connection.connect();
    connection.query('DROP TABLE Users'
                    , (err, rows, fields) => {
                        if(err)
                            console.log(err);
                        else
                            console.log("Login Table Dropped");
                    });
    connection.query('DROP TABLE Activity'
                    , (err, rows, fields) => {
                        if(err)
                            console.log(err);
                        else
                            console.log("Activity Table Dropped");
                    });
    connection.query('CREATE TABLE Users(type VARCHAR(8), username VARCHAR(100), password VARCHAR(100))'
                    , (err, rows, fields) => {
                        if(err)
                            console.log(err);
                        else
                            console.log('Users Table Created');
                    });
    connection.query('CREATE TABLE Activity(username VARCHAR(100), timestamp TIMESTAMP, level SMALLINT, completiontime TIME, success BOOL)'
                    , (err, rows, fields) => {
                        if(err)
                            console.log(err);
                        else
                            console.log('Activity Table Created');
                    });
    connection.query(`insert into Users values("student","potato","hi_there")`
                    , (err,rows,fields) => {
                        if (err)
                            console.log(err);
                        else
                            console.log('student added');
                    })
        connection.query(`insert into Users values("admin","tomato","web_dev")`
                    , (err,rows,fields) => {
                        if (err)
                            console.log(err);
                        else
                            console.log('admin added');
                    })
connection.end();