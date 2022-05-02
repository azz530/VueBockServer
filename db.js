const mysql = require('mysql');
const config = require('./config');
const db = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
});

module.exports = db;