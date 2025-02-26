require('dotenv').config();
const mysql = require('mysql2');

// Ensure the pool uses a valid MySQL connection string
const connection = mysql.createPool(process.env.DATABASE_URL).promise();

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
