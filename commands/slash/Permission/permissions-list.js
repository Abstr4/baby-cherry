require('module-alias/register');
const { SlashCommandBuilder } = require("discord.js");
const { listPermissions } = require("@root/services/permissionService.js");
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permissions-list")
        .setDescription("List who is allowed to use a specific command")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Command name")
                .setRequired(true)),

    async execute(interaction) {
        const command = interaction.options.getString("command");
        const permissions = await listPermissions(command);

        if (permissions.length === 0) {
            return sendEphemeralMessage(interaction, `No permissions found for \`${command}\`.`);
        }

        const output = permissions.map(p => {
            if (p.user_id) return `👤 <@${p.user_id}>`;
            if (p.role_id) return `🎭 <@&${p.role_id}>`;
        }).join("\n");

        return sendEphemeralMessage(interaction, `**Allowed for \`${command}\`:**\n${output}`);
    }
};
