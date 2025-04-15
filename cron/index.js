const cron = require("node-cron");
const { checkReminders } = require("./reminderChecker.js");
const { checkScouts } = require("./scoutChecker.js");

module.exports = (client) => {
    cron.schedule("*/10 * * * *", async () => {
        console.log("⏰ Running scheduled task...");
        await checkReminders(client);
        await checkScouts(client);
    }, { timezone: "UTC" });
};
