module.exports = (client) => {
    const cron = require("node-cron");
    const database = require("../database.js"); // ✅ Import it directly


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

    // Verify database connection (using async/await)
    (async () => {
        try {
            await database.query("SELECT 1");
            console.log("✅ Database connection successful");
        } catch (err) {
            console.error("🚨 Database connection failed:", err);
        }
    })();

    // Schedule reminders to run every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏳ Checking for reminders...");

        try {
            const [results] = await database.query("SELECT * FROM Reminders WHERE RemindAt <= UTC_TIMESTAMP()");

            if (!results || results.length === 0) {
                console.log("❌ No reminders found.");
                return;
            }

            console.log(`🔍 Found ${results.length} reminders.`);

            for (const reminder of results) {
                console.log(`📢 Sending reminder: ${reminder.Message} to ${reminder.ChannelId}`);
                await sendReminder(reminder.Message, reminder.ChannelId);

                // Delete reminder after sending
                await database.query("DELETE FROM Reminders WHERE ID = ?", [reminder.ID]);
                console.log(`🗑 Reminder ID ${reminder.ID} deleted.`);
            }
        } catch (err) {
            console.error("❌ Database error:", err);
        }
    }, { timezone: "UTC" });
};
