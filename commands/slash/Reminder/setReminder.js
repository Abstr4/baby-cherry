require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');

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
        .addIntegerOption(option =>
            option.setName("offsetminutes")
                .setDescription("Offset in minutes for the timestamp (1-10). Optional.")
                .setRequired(false))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the reminder (optional)")
                .setRequired(false))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to mention when the reminder triggers (optional)")
                .setRequired(false)),

    async execute(interaction) {
        const timeStr = interaction.options.getString("time");
        const message = interaction.options.getString("message");
        const offsetMinutes = interaction.options.getInteger("offsetminutes");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const channelId = channel.id;
        const role = interaction.options.getRole("role");
        const roleId = role ? role.id : null;

        // Validate time format
        const remindAt = moment.utc(timeStr, "HH:mm", true);
        if (!remindAt.isValid()) {
            return interaction.reply({
                content: "❌ Invalid time format. Use `HH:mm` in UTC.",
                flags: 64
            });
        }

        // Validate offsetMinutes only if it's provided
        if (offsetMinutes !== null && (offsetMinutes < 1 || offsetMinutes > 10)) {
            return interaction.reply({
                content: "❌ Offset must be between 1 and 10 minutes.",
                flags: 64
            });
        }

        try {
            const [result] = await database.execute(
                "INSERT INTO Reminder (Message, Time, OffsetMinutes, ChannelId, RoleId) VALUES (?, ?, ?, ?, ?)",
                [message, remindAt.format("HH:mm"), offsetMinutes, channelId, roleId]
            );

            const reminderId = result.insertId;

            await interaction.reply({
                content: `✅ Reminder **#${reminderId}**: **${message}** set for **${remindAt.format("HH:mm")} UTC** in <#${channelId}>${role ? ` for <@&${roleId}>` : ""}${offsetMinutes ? ` with timestamp +${offsetMinutes}m` : ""}.`,
                flags: 64
            });
        } catch (err) {
            console.error("❌ Database error:", err);
            return interaction.reply({ content: "❌ Failed to save reminder.", flags: 64 });
        }
    }
};
