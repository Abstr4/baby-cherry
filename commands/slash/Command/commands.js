const { SlashCommandBuilder } = require('discord.js');
const database = require("../../database.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listcommands')
        .setDescription('Lists all exclamation commands (!commands) from the database'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT Command FROM ExclamationCommands");

            if (rows.length === 0) {
                return interaction.reply({ content: 'No exclamation commands found.', ephemeral: true });
            }

            const commandList = rows.map(cmd => `• ${cmd.Command}`).join('\n');
            await interaction.reply({ content: commandList, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the command list.', ephemeral: true });
        }
    }
};
