require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const { addPermission } = require("@root/helpers/commandPermissions.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permissions-add")
        .setDescription("Add permission for a user or role to a specific command")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Command name (e.g., lands, addcommands)")
                .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to allow (optional)"))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("Role to allow (optional)")),

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

        await addPermission(command, {
            userId: user?.id || null,
            roleId: role?.id || null
        });

        await interaction.reply({
            content: `Permission added for \`${command}\` (${user ? `user: ${user.username}` : `role: ${role.name}`}).`,
            flags: 64
        });
    }
};
