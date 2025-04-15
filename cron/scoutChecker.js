require('module-alias/register');
const database = require('@database');


async function checkScouts() {
    console.log("⏳ Checking for expired scouts...");

    try {
        const expiredScouts = await database.getExpiredScouts();

        if (!expiredScouts || expiredScouts.length === 0) {
            console.log("❌ No expired scouts found.");
            return;
        }

        console.log(`🔍 Found ${expiredScouts.length} expired scouts.`);

        for (const scout of expiredScouts) {
            try {
                const user = await client.users.fetch(scout.user_id);
                await user.send(`🕵️ Your **${scout.grade}** scout has ended.`);
                console.log(`📨 Scout DM sent to ${scout.user_id}`);
            } catch (err) {
                console.error(`❌ Failed to DM user ${scout.user_id}`, err);
            }

            await database.deleteScout(scout.id);
        }
    } catch (err) {
        console.error("❌ Error checking scouts:", err);
    }
}

module.exports = { checkScouts };