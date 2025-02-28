require('module-alias/register');
const database = require('@database');

module.exports = {
    name: "allow",
    description: "Allow a user to use commands.",
    options: [
        {
            name: "user",
            type: 6, // User type
            description: "User to allow",
            required: true
        }
    ],
    execute: async (interaction) => {
        const user = interaction.options.getUser("user");

        await database.query("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);
        allowlist.add(user.id); // Update in-memory list

        return interaction.reply({ content: `${user.username} is now allowed to use commands!`, ephemeral: true });
    }
};
