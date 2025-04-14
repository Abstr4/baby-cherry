require('module-alias/register');
const database = require('@database')
const { PermissionFlagsBits } = require('discord.js');
const { isUserAllowedForCommand, isAdmin } = require('@helpers');

// In-memory allowlist
let allowList = new Set();

// Load allowlist on bot startup
const loadAllowList = async () => {
    const [rows] = await database.query("SELECT user_id FROM Allowlist");
    allowList = new Set(rows.map(row => String(row.user_id)));
    console.log("Allowlist loaded:", allowList);
};

const handleSlashCommand = async (interaction, client) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    const userId = interaction.user.id;
    const roleIds = interaction.member.roles.cache.map(role => role.id);

    // Admins can use all commands
    const isAdminCheck = isAdmin(interaction);
    const isGloballyAllowed = allowList.has(String(userId));

    if (!isAdminCheck && !isGloballyAllowed) {
        const allowed = await isUserAllowedForCommand(userId, roleIds, interaction.commandName);
        if (!allowed) {
            return interaction.reply({
                content: "🚫 You are not allowed to use this command.",
                flags: 64
            });
        }
    }

    try {
        console.log(`/${interaction.commandName} called by ${interaction.user.id}`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "❌ There was an error executing this command.",
            flags: 64
        });
    }
};
module.exports = { handleSlashCommand, loadAllowList, allowList };
