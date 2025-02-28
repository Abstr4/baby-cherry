require('module-alias/register');
const database = require('@database');
const { allowlist } = require('../handlers/slashCommands.js'); // Import allowlist

module.exports = {
    data: {
        name: "allow",
        description: "Allow a user to use commands.",
        options: [
            {
                name: "user",
                type: 6, // User type
                description: "User to allow",
                required: true
            }
        ]
    },

    async execute(interaction) {
        const user = interaction.options.getUser("user");

        try {
            await database.query("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);
            allowlist.add(user.id); // Update in-memory list

            return interaction.reply({ content: `${user.username} is now allowed to use commands!`, flags: 64 });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while updating the allowlist.", flags: 64 });
        }
    }
};
