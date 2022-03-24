// const express = require('express');

// const app = express();

// app.get('/userLogin', (res,req) => {
//     let connection = newConnection();
//     let userType;
//     let typeInput = document.getElementById("checkboxID");
//     if(typeInput.checked == false){
//         userType = 'student';
//     } else {
//         userType = 'admin'
//     }


//     let formUserName = req.query.username;
//     let formPassword = req.query.password;
//     let dbUsername;
//     let dbPassword;
//     connection.connect();
//     if (userType == 'student'){
//         connection.query(`select * from Users where type='student'`, (err,rows,fields) => {
//             let loginList = rows;
//             for (l of loginList){
//                 dbUsername = l.username;
//                 dbPassword = l.password;
//                 if((dbUsername == formUserName) && (dbPassword == formPassword)){
//                     res.redirect('algorithmsMenu.html');
//                 }
//             }
//             if ((dbUsername != formUserName) || (dbPassword != formPassword)){
//                 console.log("Invalid Cradentials");
//                 res.redirect('index.html');
//             }
//         })
//     }
//     else if (userType == 'admin'){
//         connection.query(`select * from Users where type='admin'`, (err,rows,fields) => {
//             let loginList = rows;
//             for (l of loginList){
//                 dbUsername = l.username;
//                 dbPassword = l.password;
//                 if((dbUsername == formUserName) && (dbPassword == formPassword)){
//                     res.redirect('algorithmsMenu.html');
//                 }
//             }
//             if ((dbUsername != formUserName) || (dbPassword != formPassword)){
//                 console.log("Invalid Cradentials");
//                 res.redirect('index.html');
//             }
//         })
//     }
//     else {
//         console.log("Invalid User Type");
//         res.redirect('index.html');
//     }

// })