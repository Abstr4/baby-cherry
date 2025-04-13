require('module-alias/register');
const database = require('@database');

async function isUserAllowedForCommand(userId, roleIds, commandName) {
    const placeholders = roleIds.map(() => "?").join(", ");

    const [rows] = await database.query(
        `
        SELECT 1 FROM CommandPermission
        WHERE command_name = ?
        AND (
            user_id = ?
            OR role_id IN (${placeholders})
        )
        `,
        [commandName, userId, ...roleIds]
    );

    return rows.length > 0;
}

async function addPermission(commandName, { userId = null, roleId = null }) {
    await database.query(
        `INSERT IGNORE INTO CommandPermission (command_name, user_id, role_id)
         VALUES (?, ?, ?)`,
        [commandName, userId, roleId]
    );
}

async function removePermission(commandName, { userId = null, roleId = null }) {
    await database.query(
        `DELETE FROM CommandPermission
         WHERE command_name = ? AND user_id <=> ? AND role_id <=> ?`,
        [commandName, userId, roleId]
    );
}

async function listPermissions(commandName) {
    const [rows] = await database.query(
        `SELECT user_id, role_id FROM CommandPermission WHERE command_name = ?`,
        [commandName]
    );
    return rows;
}

module.exports = {
    isUserAllowedForCommand,
    addPermission,
    removePermission,
    listPermissions
};
