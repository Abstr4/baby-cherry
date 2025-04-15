require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendNoPermissionMessage, isAdmin } = require('@helpers');
const { sendEphemeralMessage } = require('@messageService')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allowlist')
        .setDescription('Lists all users allowed to use bot commands.'),

    async execute(interaction) {
        try {
            // Check if the user has Administrator permission
            if (!isAdmin(interaction)) {
                return sendNoPermissionMessage(interaction);
            }
            const [rows] = await database.execute("SELECT user_id FROM Allowlist");

            if (rows.length === 0) {
                return sendEphemeralMessage(interaction, 'No users are in the allowlist.');
            }
            const userList = rows.map(user => `• <@${user.user_id}>`).join('\n');
            return sendEphemeralMessage(interaction, `**Allowed Users:**\n${userList}`);
        } catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, 'An error occurred while retrieving the allowlist.');
        }
    }
};
