const { SlashCommandBuilder } = require('discord.js');
const database = require("../../database.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Lists all events from the database'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT ID, Message, EventAt FROM Event");

            if (rows.length === 0) {
                return interaction.reply({ content: 'No events found.', ephemeral: true });
            }

            const eventList = rows.map(event => `• **ID:** ${event.ID} | **${event.Message}** - ${event.RemindAt}`).join('\n');
            await interaction.reply({ content: eventList, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the events.', ephemeral: true });
        }
    }
};
