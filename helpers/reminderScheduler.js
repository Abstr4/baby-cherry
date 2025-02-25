module.exports = (client) => {
    const cron = require("node-cron");
    const { database } = require("../database.js");

    async function sendReminder(message, channelId) {
        try {
            console.log(`🔍 Fetching channel ${channelId}...`);
            const channel = await client.channels.fetch(channelId);
    
            if (channel) {
                console.log(`✅ Channel found. Sending reminder: ${message}`);
                await channel.send(`🔔 Reminder: ${message}`);
                console.log(`📨 Message sent successfully!`);
            } else {
                console.error(`❌ Error: Channel ${channelId} not found.`);
            }
        } catch (err) {
            console.error("❌ Error sending reminder:", err);
        }
    }
    

    // Schedule reminders to run every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏳ Checking for reminders...");
    
        database.query("SELECT * FROM Reminders WHERE RemindAt <= UTC_TIMESTAMP()", async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return;
            }
    
            if (!results || results.length === 0) {
                console.log("❌ No reminders found. Either the query is wrong, or the timestamps are incorrect.");
                return;
            }
    
            console.log(`🔍 Query executed. Found ${results.length} reminders.`);
    
            for (const reminder of results) {
                console.log(`📢 Attempting to send reminder: ${reminder.Message} to ${reminder.ChannelId}`);
    
                try {
                    const channel = await client.channels.fetch(reminder.ChannelId);
                    if (channel) {
                        await channel.send(`🔔 Reminder: ${reminder.Message}`);
                        console.log(`✅ Reminder sent to ${reminder.ChannelId}: ${reminder.Message}`);
    
                        database.query("DELETE FROM Reminders WHERE ID = ?", [reminder.ID], (deleteErr) => {
                            if (deleteErr) console.error("❌ Error deleting reminder:", deleteErr);
                            else console.log(`🗑 Reminder ID ${reminder.ID} deleted.`);
                        });
                    } else {
                        console.error(`❌ Error: Channel ${reminder.ChannelId} not found.`);
                    }
                } catch (err) {
                    console.error("❌ Error sending reminder:", err);
                }
            }
        });
    }, { timezone: "UTC" });
    
    
    
};