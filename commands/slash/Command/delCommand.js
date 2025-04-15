require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delcommand")
        .setDescription("Deletes an existing exclamation command.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("The command to delete (e.g., !hello)")
                .setRequired(true)),

    async execute(interaction) {
        const command = interaction.options.getString("command");

        // Ensure command starts with "!"
        if (!command.startsWith("!")) {
            return interaction.reply({ content: "❌ Commands must start with `!`. Example: `!hello`", flags: 64 });
        }
        try {
            // Delete the command from the database
            const result = await database.query(
                "DELETE FROM ExclamationCommand WHERE Command = ?",
                [command]
            );
            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, `❌ Command \`${command}\` not found!`);
            }
            return sendEphemeralMessage(interaction, `✅ Command \`${command}\` has been deleted successfully!`);
        }
        catch (err) {
            console.error("❌ Database error:", err);
            return sendEphemeralMessage(interaction, "❌ Failed to delete the command due to a database error.");
        }
    }
};
