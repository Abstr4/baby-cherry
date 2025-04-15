require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editcommand')
        .setDescription('Edit the response of an exclamation command (!command)')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The name of the command (without !)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('response')
                .setDescription('The new response for the command')
                .setRequired(true)),

    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const newResponse = interaction.options.getString('response');

        try {
            const [result] = await database.execute(
                "UPDATE ExclamationCommand SET Response = ? WHERE Command = ?",
                [newResponse, commandName]
            );

            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, `❌ No command found with name \`!${commandName}\`.`);
            }
            return sendEphemeralMessage(interaction, `✅ Command \`!${commandName}\` updated successfully.`);
        }
        catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, '❌ An error occurred while updating the command.');
        }
    }
};
