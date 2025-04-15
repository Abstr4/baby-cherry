require('module-alias/register');
const { getExpiredScouts, deleteScout } = require('@root/services/scoutService.js');

const gradeColors = {
    common: "#C0C0C0", // Silver
    rare: "#008000",   // Green
    epic: "#800080",   // Purple
    legendary: "#FFD700", // Gold
    mythic: "#FF0000"  // Red
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

                // Choose the color based on grade
                const gradeColor = gradeColors[scout.grade] || "#808080"; // Default to gray if not found

                // Send a message with an embed that highlights the grade in color
                await user.send({
                    embeds: [
                        {
                            color: gradeColor,  // Sidebar color of the embed
                            description: `Your Pixel Heroes adventure **\`${scout.grade.toUpperCase()}\`** scout has ended, go get those elementals!`
                        }
                    ]
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