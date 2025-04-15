require('module-alias/register');
const { SlashCommandBuilder } = require("discord.js");
const { removePermission } = require("@root/services/permissionService.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permissions-remove")
        .setDescription("Remove permission for a user or role from a specific command")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Command name")
                .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to remove (optional)"))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to remove (optional)")),

    async execute(interaction) {
        const command = interaction.options.getString("command");
        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");

        if (!user && !role) {
            return interaction.reply({
                content: "You must provide either a user or a role.",
                flags: 64
            });
        }

        await removePermission(command, {
            userId: user?.id || null,
            roleId: role?.id || null
        });

        await interaction.reply({
            content: `Permission removed for \`${command}\` (${user ? `user: ${user.username}` : `role: ${role.name}`}).`,
            flags: 64
        });
    }
};
