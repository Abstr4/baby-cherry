require('module-alias/register');
const { getExpiredScouts, deleteScout } = require('@root/services/scoutService.js');

const gradeColors = {
    common: "silver",
    rare: "green",
    epic: "gold",
    mythic: "red"
};

async function checkScouts(client) {
    console.log("⏳ Checking for expired scouts...");

    try {
        const expiredScouts = await getExpiredScouts();

        if (!expiredScouts || expiredScouts.length === 0) {
            console.log("❌ No expired scouts found.");
            return;
        }

        console.log(`🔍 Found ${expiredScouts.length} expired scouts.`);

        for (const scout of expiredScouts) {
            try {
                const user = await client.users.fetch(scout.user_id);

                const gradeColor = gradeColors[scout.grade] || "gray";

                await user.send({
                    content: `**Your Pixel Heroes adventure [${scout.grade.toUpperCase()}](#) scout** has ended, go get those elementals!`,
                    embeds: [{
                        description: `Your Pixel Heroes adventure **${scout.grade.toUpperCase()}** scout has ended, go get those elementals!`,
                        color: gradeColor === 'silver' ? 0xC0C0C0 : gradeColor === 'green' ? 0x008000 : gradeColor === 'gold' ? 0xFFD700 : 0xFF0000,
                    }]
                });
                console.log(`📨 Scout DM sent to ${scout.user_id}`);
            } catch (err) {
                console.error(`❌ Failed to DM user ${scout.user_id}`, err);
            }

            await deleteScout(scout.id);
        }
    } catch (err) {
        console.error("❌ Error checking scouts:", err);
    }
}

module.exports = { checkScouts };