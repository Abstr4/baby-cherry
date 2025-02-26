module.exports = (client) => {
    const cron = require("node-cron");
    const database = require("../database.js"); // ✅ Import it directly


    async function sendEvent(message, channelId) {
        try {
            console.log(`🔍 Fetching channel ${channelId}...`);
            const channel = await client.channels.fetch(channelId);
    
            if (channel) {
                console.log(`✅ Channel found. Sending Event: ${message}`);
                await channel.send(`🔔 Event: ${message}`);
                console.log(`📨 Message sent successfully!`);
            } else {
                console.error(`❌ Error: Channel ${channelId} not found.`);
            }
        } catch (err) {
            console.error("❌ Error sending Event:", err);
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

    // Schedule Events to run every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏳ Checking for Events...");

        try {
            const [results] = await database.query("SELECT * FROM Event WHERE RemindAt <= UTC_TIMESTAMP()");

            if (!results || results.length === 0) {
                console.log("❌ No Events found.");
                return;
            }

            console.log(`🔍 Found ${results.length} Events.`);

            for (const Event of results) {
                console.log(`📢 Sending Event: ${Event.Message} to ${Event.ChannelId}`);
                await sendEvent(Event.Message, Event.ChannelId);

                // Delete Event after sending
                await database.query("DELETE FROM Event WHERE ID = ?", [Event.ID]);
                console.log(`🗑 Event ID ${Event.ID} deleted.`);
            }
        } catch (err) {
            console.error("❌ Database error:", err);
        }
    }, { timezone: "UTC" });
};
