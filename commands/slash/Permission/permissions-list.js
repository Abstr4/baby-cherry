require('module-alias/register');
const { SlashCommandBuilder } = require("discord.js");
const { listPermissions } = require("@root/helpers/commandPermissions.js");

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
            return interaction.reply({
                content: `No permissions found for \`${command}\`.`,
                flags: 64
            });
        }

        const output = permissions.map(p => {
            if (p.user_id) return `👤 <@${p.user_id}>`;
            if (p.role_id) return `🎭 <@&${p.role_id}>`;
        }).join("\n");

        await interaction.reply({
            content: `**Allowed for \`${command}\`:**\n${output}`,
            flags: 64
        });
    }
};
