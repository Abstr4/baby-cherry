require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { allowList } = require('../../handlers/slashCommands.js');
const { sendNoPermissionMessage, isAdmin } = require('@helpers');

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
            // Check if the user has Administrator permission
            if (!isAdmin(interaction)) {
                return sendNoPermissionMessage(interaction);
            }
            const user = interaction.options.getUser('user');

            // Check if the user is in the allowlist
            const [rows] = await database.execute("SELECT 1 FROM Allowlist WHERE user_id = ?", [user.id]);
            if (rows.length === 0) {
                return interaction.reply({ content: `${user} is not in the allowlist.`, flags: 64 });
            }

            // Delete it
            await database.execute("DELETE FROM Allowlist WHERE user_id = ?", [user.id]);

            allowList.delete(user.id); // Ensure allowlist is updated

            return interaction.reply({ content: `${user.username} is no longer allowed to use commands.`, flags: 64 });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while disallowing the user.", flags: 64 });
        }
    }
};
