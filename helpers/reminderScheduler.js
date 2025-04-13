const cron = require("node-cron");
const { Client, GatewayIntentBits } = require("discord.js");
const database = require("../database.js");

module.exports = (client) => {

    async function sendMessage(type, message, channelId, roleId, reminderTime, offsetMinutes) {
        try 
        {
            console.log(`🔍 Fetching channel ${channelId}...`);
            const channel = await client.channels.fetch(channelId);

            if (channel) {
                console.log(`✅ Channel found. Sending ${type}: ${message}`);

                const now = new Date();
                const reminderDate = new Date(now.toDateString());
                const [hours, minutes] = reminderTime.split(':').map(Number);
                
                reminderDate.setUTCHours(hours, minutes + offsetMinutes, 0, 0); 

                const timestamp = Math.floor(reminderDate.getTime() / 1000);

                const formattedMessage = roleId 
                    ? `🔔 ${type}: <@&${roleId}> <t:${timestamp}:R> ${message}` 
                    : `🔔 ${type}: <t:${timestamp}:R> ${message}`;

                await channel.send(formattedMessage);
                console.log(`📨 Message sent successfully!`);
            } 
            else 
            {
                console.error(`❌ Error: Channel ${channelId} not found.`);
            }
        } 
        catch (err) 
        {
            console.error(`❌ Error sending ${type}:`, err);
        }
    }

    cron.schedule("*/10 * * * *", async () => {
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
                console.log(`📢 Sending Reminder: ${item.Message} to ${item.ChannelId} (Role: ${item.RoleId})`);
                await sendMessage(
                    "Reminder",
                    item.Message,
                    item.ChannelId,
                    item.RoleId,
                    item.Time,
                    item.OffsetMinutes || 0 // Si OffsetMinutes es null, usamos 0 por defecto
                );
            }
        } catch (err) {
            console.error("❌ Database error:", err);
        }
    }, { timezone: "UTC" });

};
