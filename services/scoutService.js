const connection = require('../database');

// Add a new scout timer
async function insertScout(userId, grade, endsAt) {
    await connection.query(
        "INSERT INTO scouts (user_id, grade, ends_at) VALUES (?, ?, ?)",
        [userId, grade, endsAt]
    );
}

// Get all expired scouts
async function getExpiredScouts() {
    const [rows] = await connection.query(
        "SELECT * FROM scouts WHERE ends_at <= ?",
        [Date.now()]
    );
    return rows;
}

// Delete scout after sending DM
async function deleteScout(id) {
    await connection.query("DELETE FROM scouts WHERE id = ?", [id]);
}

module.exports = {
    insertScout,
    getExpiredScouts,
    deleteScout
};
