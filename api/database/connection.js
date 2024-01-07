const mysql = require('mysql');

const connection = mysql.createConnection({
    /**
     * These credentials are outdated, intended for a database connection on blue.
     */
    debug: false,
    host: '127.0.0.1',
    port: 3306,
    database: 'srichenb_cs355fa22',
    user: 'srichenb_cs355fa22',
    password: 'fake_password_hello_git',
});

module.exports = connection;
