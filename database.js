require('dotenv').config();
const mysql = require('mysql2');

// Ensure the pool uses a valid MySQL connection string
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

// 🟢 Add a new scout timer
async function insertScout(userId, grade, endsAt) {
    await pool.query(
        "INSERT INTO scouts (user_id, grade, ends_at) VALUES (?, ?, ?)",
        [userId, grade, endsAt]
    );
}

// 🔍 Get all expired scouts
async function getExpiredScouts() {
    const [rows] = await pool.query(
        "SELECT * FROM scouts WHERE ends_at <= ?",
        [Date.now()]
    );
    return rows;
}

// ❌ Delete scout after sending DM
async function deleteScout(id) {
    await pool.query("DELETE FROM scouts WHERE id = ?", [id]);
}

module.exports = {
    connection,
    insertScout,
    getExpiredScouts,
    deleteScout
};
