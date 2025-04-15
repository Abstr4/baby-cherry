require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addcommand')
        .setDescription('Add a static exclamation command')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('The exclamation command name (e.g., hello)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('response')
                .setDescription('The response of the command')
                .setRequired(true)),

    async execute(interaction) {
        let commandName = interaction.options.getString("command").trim().toLowerCase();
        const response = interaction.options.getString("response");

        // Automatically add "!" if not present
        if (!commandName.startsWith("!")) {
            commandName = "!" + commandName;
        }
        try {
            // Check if the command already exists
            const [existing] = await database.query(
                "SELECT * FROM ExclamationCommand WHERE Command = ?",
                [commandName]
            );
            if (existing.length > 0) {
                return sendEphemeralMessage(interaction, `❌ The command \`${commandName}\` already exists.`);
            }
            await database.query(
                "INSERT INTO ExclamationCommand (Command, Response) VALUES (?, ?)",
                [commandName, response]
            );
            return sendEphemeralMessage(interaction, `✅ Command \`${commandName}\` has been added successfully!`);

        } catch (err) {
            console.error("❌ Database error:", err);
            return sendEphemeralMessage(interaction, "❌ Failed to add the command due to a database error.");
        }
    }
};
