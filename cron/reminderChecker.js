const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const database = require("@database");

async function sendReminderMessage(client, type, message, channelId, roleId, reminderTime, offsetMinutes, imageUrl, reminderId) {
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

        const embed = new EmbedBuilder()
            .setTitle(`🔔 Reminder #${reminderId}`)  // Added reminder ID to the title
            .setDescription(`${timestamp ? `⏰ <t:${timestamp}:R>\n` : ""}${message}`)
            .setColor(0x00AE86);
        embed.setFooter({ text: "📢 If you subscribe to one notification in this channel, you'll receive all of them." });

        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`subscribe_${roleId}`)
                .setLabel("Subscribe")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`unsubscribe_${roleId}`)
                .setLabel("Unsubscribe")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: roleId ? `<@&${roleId}>` : null,
            embeds: [embed],
            components: [row],
        });

        console.log(`📨 Reminder sent to ${channelId}`);
        // 🕙 Delete the message after 10 minutes
        setTimeout(() => {
            console.log(`🧹 Attempting to delete reminder message ID: ${sentMessage.id}`);
            sentMessage.delete().catch(err => {
                console.error(`❌ Failed to delete reminder message (ID: ${sentMessage.id}):`, err);
            });
        }, 600000); // 10 minutes

    } catch (err) {
        console.error(`❌ Error sending ${type}:`, err);
    }
}

async function checkReminders(client) {
    console.log("⏳ Checking for Reminders...");

    try {
        const [results] = await database.query(`
            SELECT ID, Message, ChannelId, RoleId, Time, OffsetMinutes, ImageUrl
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
                item.OffsetMinutes,
                item.ImageUrl,
                item.ID  // Pass the reminder ID here
            );
        }
    } catch (err) {
        console.error("❌ Database error during reminder check:", err);
    }
}

module.exports = {
    checkReminders
};
