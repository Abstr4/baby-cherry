require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { allowList } = require('@root/commands/handlers/slashCommands.js');
const { sendNoPermissionMessage, isAdmin } = require('@helpers');
const { sendEphemeralMessage } = require('@messageService')

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
                return sendEphemeralMessage(interaction, `${user} is not in the allowlist.`);
            }
            // Delete it
            await database.execute("DELETE FROM Allowlist WHERE user_id = ?", [user.id]);
            allowList.delete(user.id);

            return sendEphemeralMessage(interaction, `${user} is no longer allowed to use commands.`);
        } catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, "An error occurred while disallowing the user.");
        }
    }
};
