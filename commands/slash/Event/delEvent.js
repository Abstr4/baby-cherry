require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delevent')
        .setDescription('Deletes a event by ID')
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
                return interaction.reply({ content: 'No event found with that ID.', flags: 64 });
            }

            await interaction.reply({ content: `event with ID **${id}** deleted.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while deleting the event.', flags: 64 });
        }
    }
};