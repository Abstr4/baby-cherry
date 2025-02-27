require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Lists all events from the database'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT ID, Message, EventAt, ChannelId, RoleId FROM Event");

            if (rows.length === 0) {
                return interaction.reply({ content: 'No events found.', ephemeral: true });
            }

            const eventList = rows.map(event => 
                `• **ID:** ${event.ID} | **${event.Message}** - <t:${Math.floor(new Date(event.EventAt).getTime() / 1000)}:F> ` +
                `in <#${event.ChannelId}> ${event.RoleId ? `for <@&${event.RoleId}>` : ""}`
            ).join('\n');

            await interaction.reply({ content: eventList, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the events.', ephemeral: true });
        }
    }
};
