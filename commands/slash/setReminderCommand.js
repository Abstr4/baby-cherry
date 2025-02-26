const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("setreminder")
    .setDescription("Set a reminder for everyone.")
    .addStringOption(option =>
        option.setName("date")
            .setDescription("Date and time (YYYY-MM-DD HH:mm) in UTC.")
            .setRequired(true))
    .addStringOption(option =>
        option.setName("message")
            .setDescription("Reminder message.")
            .setRequired(true))
    .addChannelOption(option =>
        option.setName("channel")
            .setDescription("The channel to send the reminder (optional)")
            .setRequired(false)),
    
    async execute(interaction) {
        const dateStr = interaction.options.getString("date");
        const message = interaction.options.getString("message");
        const channel = interaction.options.getChannel("channel") || interaction.channel;
        const channelId = channel.id;
    
        // Validate date format
        const remindAt = moment.utc(dateStr, "YYYY-MM-DD HH:mm", true);
        if (!remindAt.isValid()) {
            return interaction.reply({
                content: "❌ Invalid date format. Use `YYYY-MM-DD HH:mm` in UTC.",
                ephemeral: true // ✅ Use `ephemeral: true` instead of `flags: 64`
            });
        }
    
        try {
            // ✅ Use `await db.execute()` since `pool` supports promises
            await database.execute(
                "INSERT INTO Reminders (Message, RemindAt, ChannelId) VALUES (?, ?, ?)",
                [message, remindAt.format("YYYY-MM-DD HH:mm:ss"), channelId]
            );
    
            await interaction.reply({
                content: `✅ Reminder set for <t:${Math.floor(remindAt.unix())}:F> in <#${channelId}>.`,
                ephemeral: true
            });
        } catch (err) {
            console.error("❌ Database error:", err);
            return interaction.reply({ content: "❌ Failed to save reminder.", ephemeral: true });
        }
    }
};

