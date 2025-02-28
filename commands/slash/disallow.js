const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { allowList } = require('../handlers/slashCommands.js'); // Import allowlist

module.exports = {
    data: new SlashCommandBuilder()
        .setName("disallow")
        .setDescription("Remove a user from the allowlist.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to disallow")
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const user = interaction.options.getUser("user");
            await database.execute("DELETE FROM Allowlist WHERE user_id = ?", [user.id]);

            allowList.delete(user.id); // Ensure allowlist is updated

            return interaction.reply({ content: `${user.username} is no longer allowed to use commands.`, flags: 64 });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while disallowing the user.", flags: 64 });
        }
    }
};
