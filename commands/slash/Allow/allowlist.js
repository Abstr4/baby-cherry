require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendNoPermissionMessage, isAdmin } = require('@helpers');

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
                return interaction.reply({ content: 'No users are in the allowlist.', flags: 64 });
            }

            const userList = rows.map(user => `• <@${user.user_id}>`).join('\n');

            await interaction.reply({ content: `**Allowed Users:**\n${userList}`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the allowlist.', flags: 64 });
        }
    }
};
