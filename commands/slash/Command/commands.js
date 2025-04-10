require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Lists all exclamation commands (!commands) from the database'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT Command, Message FROM ExclamationCommand");

            if (rows.length === 0) {
                return interaction.reply({ content: 'No exclamation commands found.', flags: 64 });
            }

            const commandList = rows.map(cmd => `• ${cmd.Command}: ${cmd.Message}`).join('\n');
            await interaction.reply({ content: commandList, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the command list.', flags: 64 });
        }
    }
};
