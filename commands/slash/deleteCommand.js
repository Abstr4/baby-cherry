const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require("../../database.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deletecommand")
        .setDescription("Deletes an existing command from the bot.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("The command to delete (e.g., !hello)")
                .setRequired(true)),

    async execute(interaction) {
        const userId = interaction.user.id;
        const member = interaction.member;
        const command = interaction.options.getString("command");

        // Ensure command starts with "!"
        if (!command.startsWith("!")) {
            return interaction.reply({ content: "❌ Commands must start with `!`. Example: `!hello`", ephemeral: true });
        }

        // Permission check
        if (
            member.permissions.has(PermissionFlagsBits.Administrator) ||
            allowedUsers.includes(userId)
        ) {
            // Defer the reply to prevent timeouts
            await interaction.deferReply({ ephemeral: true });

            database.query(
                "DELETE FROM ExclamationCommands WHERE Command = ?",
                [command],
                async (err, result) => {
                    if (err) {
                        console.error("❌ Database error:", err);
                        return interaction.editReply({ content: "❌ Failed to delete command!" });
                    }
                    if (result.affectedRows === 0) {
                        return interaction.editReply({ content: `❌ Command **${command}** not found!` });
                    }
                    await interaction.editReply({ content: `✅ Command **${command}** deleted successfully!` });
                }
            );
        } else {
            await interaction.reply({ content: "❌ You do not have permission to use this command!", ephemeral: true });
        }
    }
};
