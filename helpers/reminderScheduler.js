module.exports = (client) => {
    const cron = require("node-cron");
    const { database } = require("../database.js");

    // Function to send the reminder
    async function sendReminder(message, channelId) {
        try {
            console.log("Trying to send reminder to channel:", channelId);
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send(`🔔 Reminder: ${message}`);
                console.log(`✅ Reminder sent to ${channelId}: ${message}`);
            } else {
                console.error(`❌ Error: Channel ${channelId} not found.`);
            }
        } catch (err) {
            console.error("❌ Error sending reminder:", err);
        }
    }

    // Schedule reminders to run every minute
    cron.schedule("* * * * *", () => {
        console.log("⏳ Checking for reminders...");
        database.query("SELECT * FROM Reminders WHERE RemindAt <= NOW()", (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return;
            }

            results.forEach(reminder => {
                sendReminder(reminder.Message, reminder.ChannelId);
                // Optionally, delete the reminder after sending it
                database.query("DELETE FROM Reminders WHERE ID = ?", [reminder.ID], (deleteErr) => {
                    if (deleteErr) console.error("❌ Error deleting reminder:", deleteErr);
                    else console.log(`🗑 Reminder ID ${reminder.ID} deleted.`);
                });
            });
        });
    });
};