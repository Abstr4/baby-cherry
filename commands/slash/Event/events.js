require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('events')
        .setDescription('Lists all events from the database.'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT ID, Message, EventAt, ChannelId, RoleId FROM Event");

            if (rows.length === 0) {
                return interaction.reply({ content: '📭 No events found.', flags: 64 });
            }

            const embeds = [];
            let current = '';
            let page = 1;

            for (let i = 0; i < rows.length; i++) {
                const event = rows[i];
                const line =
                    `**ID ${event.ID}** → ${event.Message}\n` +
                    `⏰ <t:${Math.floor(new Date(event.EventAt).getTime() / 1000)}:F>\n` +
                    `📍 <#${event.ChannelId}> ${event.RoleId ? `| 🔔 <@&${event.RoleId}>` : ""}\n\n`;

                if (current.length + line.length > 4000) {
                    embeds.push(new EmbedBuilder()
                        .setTitle('📅 Upcoming Events')
                        .setDescription(current)
                        .setColor('#57F287')
                        .setFooter({ text: `Page ${page}` }));
                    current = '';
                    page++;
                }

                current += line;
            }

            // Push remaining
            if (current) {
                embeds.push(new EmbedBuilder()
                    .setTitle('📅 Upcoming Events')
                    .setDescription(current)
                    .setColor('#57F287')
                    .setFooter({ text: `Page ${page}` }));
            }

            // Send embeds
            await interaction.reply({ embeds: [embeds[0]], flags: 64 });
            for (let i = 1; i < embeds.length; i++) {
                await interaction.followUp({ embeds: [embeds[i]], flags: 64 });
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ An error occurred while retrieving the events.', flags: 64 });
        }
    }
};
