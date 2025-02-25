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
    
        database.query("SELECT * FROM Reminders WHERE RemindAt <= UTC_TIMESTAMP()", (err, results) => {
            if (err) {
                console.error("❌ Database error:", err);
                return;
            }
    
            console.log("📊 Raw query result:", results); // <---- PRINT FULL QUERY RESULT
    
            if (!results || results.length === 0) {
                console.log("❌ No reminders found.");
                return;
            }
    
            console.log(`🔍 Query executed. Found ${results.length} reminders.`);
    
            results.forEach(reminder => {
                console.log(`📢 Attempting to send reminder: ${reminder.Message} to ${reminder.ChannelId}`);
            });
        });
    }, { timezone: "UTC" });    
};