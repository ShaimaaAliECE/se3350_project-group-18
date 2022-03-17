const mysql = require('mysql');

function newConnection(){
    let connection = mysql.createConnection({
        host: '104.154.250.13',
        user: 'root',
        password: 'BaLIss3qut1O6j4B',
        database: 'UserAuth'
    });
    return connection;
}
module.exports = newConnection;