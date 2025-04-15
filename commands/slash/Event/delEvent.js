require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delevent')
        .setDescription('Deletes a event by ID.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the event to delete')
                .setRequired(true)
        ),

    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        try {
            const [result] = await database.execute("DELETE FROM Event WHERE ID = ?", [id]);

            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, 'No event found with that ID.');
            }
            return sendEphemeralMessage(interaction, `event with ID **${id}** deleted.`);
        } catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, 'An error occurred while deleting the event.');
        }
    }
};