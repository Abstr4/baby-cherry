require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editevent')
        .setDescription('Edit an event by ID.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID of the event to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('New message for the event')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time in HH:mm format (UTC)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to tag')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Optional role to tag')
                .setRequired(false)),

    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const message = interaction.options.getString('message');
        const timeStr = interaction.options.getString('time');
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');

        // Validate time format
        const eventAt = moment.utc(timeStr, "HH:mm", true);
        if (!eventAt.isValid()) {
            return interaction.reply({
                content: "❌ Invalid time format. Use `HH:mm` in UTC.",
                flags: 64
            });
        }

        const now = moment.utc();
        if (eventAt.isBefore(now)) {
            return interaction.reply({
                content: "❌ Time must be in the future (UTC).",
                flags: 64
            });
        }

        try {
            const [result] = await database.execute(
                `UPDATE Event SET Message = ?, EventAt = ?, ChannelId = ?, RoleId = ? WHERE ID = ?`,
                [message, eventAt.toDate(), channel.id, role?.id || null, id]
            );

            if (result.affectedRows === 0) {
                return interaction.reply({
                    content: `❌ No event found with ID \`${id}\`.`,
                    flags: 64
                });
            }

            return interaction.reply({
                content: `✅ Event \`${id}\` updated successfully.`,
                flags: 64
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ An error occurred while updating the event.',
                flags: 64
            });
        }
    }
};
