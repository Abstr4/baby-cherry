require('module-alias/register');
const database = require('@database')
const { PermissionFlagsBits } = require('discord.js');

let allowList = new Set(); // In-memory allowlist


// Load allowlist on bot startup
const loadAllowList = async () => {
    const result = await database.query("SELECT user_id FROM Allowlist");
    allowList = new Set(result.map(row => String(row.user_id)));

    console.log("Allowlist loaded:", allowList);
};

const handleSlashCommand = async (interaction, client) => {

    if (!interaction.isCommand()) return;

    console.log("Checking user:", interaction.user.id, "Allowlist has:", allowList.has(interaction.user.id));
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) 
    {
        if(!allowList.has(interaction.user.id))
        {   
            return interaction.reply({ content: "You are not allowed to use this bot!", flags: 64 });
        }         
    }

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        console.log(`/${interaction.commandName} called by ${interaction.user.id}`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command!", flags: 64 });
    }
};

module.exports = { handleSlashCommand, loadAllowList, allowList };
