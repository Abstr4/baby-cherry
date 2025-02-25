const mysql = require('mysql2');

const connection = mysql.createPool(process.env.MYSQL);

// Test connection
connection.getConnection((err, conn) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to MySQL database!");
        conn.release();
    }
});

module.exports = connection;
