require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool(process.env.MYSQL).promise();

// Test connection
connection.getConnection()
    .then(conn => {
        console.log("✅ Connected to MySQL database!");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });

module.exports = connection;
