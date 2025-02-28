require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
            .setName('addcommand')
            .setDescription('Add a static exclamation command')
            .addStringOption(option =>
                option
                    .setName('command')
                    .setDescription('The exclamation command name (e.g., !hello)')
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('response')
                    .setDescription('The response of the command')
                    .setRequired(true)),

    async execute(interaction) {
        const commandName = interaction.options.getString("command");
        const response = interaction.options.getString("response");

            // Ensure command starts with "!"
        if (!commandName.startsWith("!")) {
            return interaction.reply({ content: "❌ Commands must start with `!`. Example: `!hello`", flags: 64 });
        }
        try {
            // Check if the command already exists
            const [existing] = await database.query(
                "SELECT * FROM ExclamationCommand WHERE Command = ?",
                [commandName]
            );

            if (existing.length > 0) {
                return interaction.reply({
                    content: `❌ The command \`${commandName}\` already exists.`,
                    flags: 64
                });
            }
            
            // Insert the new command
            await database.query(
                "INSERT INTO ExclamationCommand (Command, Response) VALUES (?, ?)",
                [commandName, response]
            );

            return interaction.reply({
                content: `✅ Command \`${commandName}\` has been added successfully!`,
                flags: 64
            });

        } catch (err) {
            console.error("❌ Database error:", err);
            return interaction.reply({
                content: "❌ Failed to add the command due to a database error.",
                flags: 64
            });
        }
    }
};
