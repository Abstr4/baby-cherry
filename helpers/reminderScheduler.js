module.exports = (client) => {
    const cron = require("node-cron");
    const database = require("../database.js"); // ✅ Import it directly

    async function sendMessage(type, message, channelId) {
        try {
            console.log(`🔍 Fetching channel ${channelId}...`);
            const channel = await client.channels.fetch(channelId);
    
            if (channel) {
                console.log(`✅ Channel found. Sending ${type}: ${message}`);
                await channel.send(`🔔 ${type}: ${message}`);
                console.log(`📨 Message sent successfully!`);
            } else {
                console.error(`❌ Error: Channel ${channelId} not found.`);
            }
        } catch (err) {
            console.error(`❌ Error sending ${type}:`, err);
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

    // Schedule task to check both Events and Reminders every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏳ Checking for Events and Reminders...");

        try {
            // Fetch Events and Reminders together
            const [results] = await database.query(`
                (SELECT ID, Message, ChannelId, 'Event' AS Type FROM Event WHERE EventAt <= UTC_TIMESTAMP())
                UNION ALL
                (SELECT ID, Message, ChannelId, 'Reminder' AS Type FROM Reminder WHERE TIME_FORMAT(ReminderAt, '%H:%i') = TIME_FORMAT(UTC_TIME(), '%H:%i'))
            `);

            if (!results || results.length === 0) {
                console.log("❌ No Events or Reminders found.");
                return;
            }

            console.log(`🔍 Found ${results.length} items.`);

            for (const item of results) {
                console.log(`📢 Sending ${item.Type}: ${item.Message} to ${item.ChannelId}`);
                await sendMessage(item.Type, item.Message, item.ChannelId);

                if (item.Type === "Event") {
                    // Delete Events after execution
                    await database.query("DELETE FROM Event WHERE ID = ?", [item.ID]);
                    console.log(`🗑 Event ID ${item.ID} deleted.`);
                }
            }
        } catch (err) {
            console.error("❌ Database error:", err);
        }
    }, { timezone: "UTC" });
};
