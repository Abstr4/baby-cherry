const { Client, GatewayIntentBits } = require("discord.js");
const connection = require("../database.js");
const cron = require("node-cron");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Function to send reminders
async function sendReminder(message, channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send(`🔔 Reminder: ${message}`);
            console.log(`✅ Reminder sent: ${message}`);
        } else {
            console.error(`❌ Could not find channel ID: ${channelId}`);
        }
    } catch (err) {
        console.error("❌ Error sending reminder:", err);
    }
}

// Run every minute to check for due reminders
cron.schedule("* * * * *", () => {
    const now = new Date().toISOString().slice(0, 16).replace("T", " "); // Format: YYYY-MM-DD HH:mm

    connection.query(
        "SELECT * FROM Reminders WHERE RemindAt <= ?",
        [now],
        (err, results) => {
            if (err) {
                console.error("❌ Database query error:", err);
                return;
            }

            results.forEach((reminder) => {
                sendReminder(reminder.Message, reminder.ChannelId);

                // Delete reminder after sending
                connection.query("DELETE FROM Reminders WHERE ID = ?", [reminder.ID], (err) => {
                    if (err) console.error("❌ Failed to delete reminder:", err);
                });
            });
        }
    );
});

module.exports = { sendReminder };
