require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delreminder')
        .setDescription('Deletes a reminder by ID.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the reminder to delete')
                .setRequired(true)
        ),

    async execute(interaction) {
        const id = interaction.options.getInteger('id');

        try {
            const [result] = await database.execute("DELETE FROM Reminder WHERE ID = ?", [id]);

            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, 'No reminder found with that ID.');
            }
            return sendEphemeralMessage(interaction, `Reminder with ID **${id}** deleted.`);
        } catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, 'An error occurred while deleting the reminder.');
        }
    }
};
