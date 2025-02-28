require('module-alias/register');
const database = require('@database')

let allowlist = new Set(); // In-memory allowlist

// Load allowlist on bot startup
const loadAllowList = async () => {
    const result = await database.query("SELECT user_id FROM Allowlist");
    allowlist = new Set(result.map(row => row.user_id));
    console.log("Allowlist loaded:", allowlist);
};

const handleSlashCommand = async (interaction, client) => {
    if (!interaction.isCommand()) return;

    if (!allowlist.has(interaction.user.id)) {
        return interaction.reply({ content: "You are not allowed to use this bot!", ephemeral: true });
    }

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        console.log(`/${interaction.commandName} called by ${interaction.user.id}`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command!", ephemeral: true });
    }
};

module.exports = { handleSlashCommand, loadAllowList };
