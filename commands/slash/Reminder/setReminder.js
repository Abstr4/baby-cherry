require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setreminder")
        .setDescription("Set a daily reminder for everyone.")
        .addStringOption(option =>
            option.setName("time")
                .setDescription("Time (HH:mm) in UTC.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Reminder message.")
                .setRequired(true))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to mention when the reminder triggers (optional)")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("offsetminutes")
                .setDescription("Offset in minutes for the timestamp (1-10). Optional.")
                .setRequired(false))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the reminder (optional)")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("imageurl")
                .setDescription("Optional image URL to display in the embed.")
                .setRequired(false)),

    async execute(interaction) {
        const timeStr = interaction.options.getString("time");
        const message = interaction.options.getString("message");
        const offsetMinutes = interaction.options.getInteger("offsetminutes");
        const imageUrl = interaction.options.getString("imageurl") || null;
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const channelId = channel.id;
        const role = interaction.options.getRole("role");
        const roleId = role ? role.id : null;

        // Validate time format
        const remindAt = moment.utc(timeStr, "HH:mm", true);
        if (!remindAt.isValid()) {
            return sendEphemeralMessage(interaction, "❌ Invalid time format. Use `HH:mm` in UTC.");
        }

        // Validate offsetMinutes only if it's provided
        if (offsetMinutes !== null && (offsetMinutes < 1 || offsetMinutes > 10)) {
            return sendEphemeralMessage(interaction, "❌ Offset must be between 1 and 10 minutes.");
        }

        // Optional: basic image URL validation
        if (imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
            return sendEphemeralMessage(interaction, "❌ Invalid image URL. Must be a direct link to an image.");
        }

        try {
            const [result] = await database.execute(
                "INSERT INTO Reminder (Message, Time, OffsetMinutes, ChannelId, RoleId, ImageUrl) VALUES (?, ?, ?, ?, ?, ?)",
                [message, remindAt.format("HH:mm"), offsetMinutes, channelId, roleId, imageUrl]
            );

            const reminderId = result.insertId;

            await interaction.reply({
                content: `✅ Reminder **#${reminderId}**: **${message}** set for **${remindAt.format("HH:mm")} UTC** in <#${channelId}>${role ? ` for <@&${roleId}>` : ""}${offsetMinutes ? ` with timestamp +${offsetMinutes}m` : ""}${imageUrl ? ` with image.` : ""}`,
                flags: 64
            });
        } catch (err) {
            console.error("❌ Database error:", err);
            return sendEphemeralMessage(interaction, "❌ Failed to save reminder.");
        }
    }
};
