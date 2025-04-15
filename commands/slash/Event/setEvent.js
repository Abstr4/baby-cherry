require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setevent")
        .setDescription("Set an event for everyone.")
        .addStringOption(option =>
            option.setName("date")
                .setDescription("Date and time (YYYY-MM-DD HH:mm) in UTC.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Event message.")
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the event (optional)")
                .setRequired(false))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to mention when the event starts (optional)")
                .setRequired(false)),

    async execute(interaction) {
        const dateStr = interaction.options.getString("date");
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const channelId = channel.id;
        const role = interaction.options.getRole("role");
        const roleId = role ? role.id : null; // Set RoleId to NULL if no role is provided

        // Validate date format
        const remindAt = moment.utc(dateStr, "YYYY-MM-DD HH:mm", true);
        if (!remindAt.isValid()) {
            return sendEphemeralMessage(interaction, "❌ Invalid date format. Use `YYYY-MM-DD HH:mm` in UTC.");
        }

        try {
            // Insert event into the database
            const [result] = await database.execute(
                "INSERT INTO Event (Message, EventAt, ChannelId, RoleId) VALUES (?, ?, ?, ?)",
                [message, remindAt.format("YYYY-MM-DD HH:mm:ss"), channelId, roleId]
            );

            const eventId = result.insertId; // ✅ Get the inserted event ID
            return sendEphemeralMessage(interaction, `✅ Event **#${eventId}**: **${message}** set for <t:${Math.floor(remindAt.unix())}:F> in <#${channelId}>${role ? ` for <@&${roleId}>` : ""}.`);
        } catch (err) {
            console.error("❌ Database error:", err);
            return sendEphemeralMessage(interaction, "❌ Failed to save event.");
        }
    }
};
