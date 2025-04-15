const database = require("@database");

async function sendReminderMessage(client, type, message, channelId, roleId, reminderTime, offsetMinutes) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error(`❌ Channel ${channelId} not found.`);
            return;
        }

        let timestamp = null;
        if (offsetMinutes > 0) {
            const now = new Date();
            const reminderDate = new Date(now.toDateString());
            const [hours, minutes] = reminderTime.split(':').map(Number);
            reminderDate.setUTCHours(hours, minutes + offsetMinutes, 0, 0);
            timestamp = Math.floor(reminderDate.getTime() / 1000);
        }

        const formattedMessage = roleId
            ? `🔔 ${type}: <@&${roleId}>${timestamp ? ` <t:${timestamp}:R>` : ''} ${message}`
            : `🔔 ${type}:${timestamp ? ` <t:${timestamp}:R>` : ''} ${message}`;

        await channel.send(formattedMessage);
        console.log(`📨 Reminder sent to ${channelId}`);
    } catch (err) {
        console.error(`❌ Error sending ${type}:`, err);
    }
}

async function checkReminders(client) {
    console.log("⏳ Checking for Reminders...");

    try {
        const [results] = await database.query(`
            SELECT ID, Message, ChannelId, RoleId, Time, OffsetMinutes
            FROM Reminder
            WHERE TIME_FORMAT(Time, '%H:%i') = TIME_FORMAT(UTC_TIME(), '%H:%i')
        `);

        if (!results || results.length === 0) {
            console.log("❌ No Reminders found.");
            return;
        }

        console.log(`🔍 Found ${results.length} reminders.`);

        for (const item of results) {
            await sendReminderMessage(
                client,
                "Reminder",
                item.Message,
                item.ChannelId,
                item.RoleId,
                item.Time,
                item.OffsetMinutes
            );
        }
    } catch (err) {
        console.error("❌ Database error during reminder check:", err);
    }
}

module.exports = {
    checkReminders
};
