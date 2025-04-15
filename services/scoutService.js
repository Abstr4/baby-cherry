const connection = require('../database');

// Add a new scout timer
async function insertScout(userId, grade, endsAt) {
    await connection.query(
        "INSERT INTO Scouts (user_id, grade, ends_at) VALUES (?, ?, ?)",
        [userId, grade, endsAt]
    );
}

// Get all expired scouts
async function getExpiredScouts() {
    const [rows] = await connection.query(
        "SELECT * FROM Scouts WHERE ends_at <= ?",
        [Date.now()]
    );
    return rows;
}

// Delete scout after sending DM
async function deleteScout(id) {
    await connection.query("DELETE FROM Scouts WHERE id = ?", [id]);
}

module.exports = {
    insertScout,
    getExpiredScouts,
    deleteScout
};
