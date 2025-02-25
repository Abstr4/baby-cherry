const cron = require('node-cron');

function scheduleBossReminder(client) {
    const channelId = '1221395301433081916'; // Replace with your channel ID
    const roleId = '1307759931016871987'; // Replace with @pha's role ID

    cron.schedule('50 11,23 * * *', async () => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send(`<@&${roleId}> :clown: Pierrot boss starts in 10 mins`);
                console.log("Boss reminder sent!");
            }
        } catch (err) {
            console.error("Failed to send boss reminder:", err);
        }
    }, { timezone: "UTC" });

    console.log("Boss reminder scheduler started.");
}

module.exports = scheduleBossReminder;
