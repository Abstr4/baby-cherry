require('module-alias/register');
const database = require('@database')

module.exports = {
    name: "disallow",
    description: "Remove a user from the allowlist.",
    options: [
        {
            name: "user",
            type: 6,
            description: "User to disallow",
            required: true
        }
    ],
    execute: async (interaction) => {
        const user = interaction.options.getUser("user");

        await database.query("DELETE FROM Allowlist WHERE user_id = ?", [user.id]);
        allowlist.delete(user.id); // Update in-memory list

        return interaction.reply({ content: `${user.username} is no longer allowed to use commands!`, ephemeral: true });
    }
};

