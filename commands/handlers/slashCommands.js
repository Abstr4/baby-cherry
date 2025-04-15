require('module-alias/register');
const database = require('@database')
const { isAdmin } = require('@helpers');
const { isUserAllowedForCommand } = require('@root/helpers/commandPermissions.js');

// In-memory allowlist
let allowList = new Set();

// Load allowlist on bot startup
const loadAllowList = async () => {
    const [rows] = await database.connection.query("SELECT user_id FROM Allowlist");
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
    console.log(isAdminCheck);
    const isGloballyAllowed = allowList.has(String(userId));
    console.log(isGloballyAllowed);

    console.log("handle guard 1.");

    if (!isAdminCheck && !isGloballyAllowed) {
        console.log("handle guard 2");

        console.log(`userId: ${userId}, roleIds: ${roleIds}, commandName: ${interaction.commandName}`);

        const allowed = await isUserAllowedForCommand(userId, roleIds, interaction.commandName);

        console.log(allowed);

        if (!allowed) {
            return interaction.reply({
                content: "🚫 You are not allowed to use this command.",
                flags: 64
            });
        }
    }

    console.log("handle guard 3");
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
