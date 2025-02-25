module.exports = (client) => {
    const cron = require("node-cron");
    const database = require("../database.js");

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

    // Verify database connection
    database.query("SELECT 1", (err, results) => {
        if (err) {
            console.error("🚨 Database connection failed:", err);
        } else {
            console.log("✅ Database connection successful");
        }
    });

    // Schedule reminders to run every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏳ Checking for reminders...");
    
        database.query("SELECT * FROM Reminders WHERE RemindAt <= UTC_TIMESTAMP()", async (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return;
            }
    
            console.log("📊 Raw query result:", results); // Debugging output
    
            if (!results || results.length === 0) {
                console.log("❌ No reminders found.");
                return;
            }
    
            console.log(`🔍 Query executed. Found ${results.length} reminders.`);
    
            for (const reminder of results) {
                console.log(`📢 Sending reminder: ${reminder.Message} to ${reminder.ChannelId}`);
                await sendReminder(reminder.Message, reminder.ChannelId);

                // Delete reminder after sending
                database.query("DELETE FROM Reminders WHERE ID = ?", [reminder.ID], (deleteErr) => {
                    if (deleteErr) console.error("❌ Error deleting reminder:", deleteErr);
                    else console.log(`🗑 Reminder ID ${reminder.ID} deleted.`);
                });
            }
        });
    }, { timezone: "UTC" });
};
