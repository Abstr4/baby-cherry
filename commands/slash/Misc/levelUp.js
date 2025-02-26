require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const { calculateResources } = require('@root/wildForest/calculateResources.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelup')
        .setDescription('Calculate the resources needed to level up')
        .addIntegerOption(option =>
            option
                .setName('start')
                .setDescription('The starting level')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('end')
                .setDescription('The ending level')
                .setRequired(true)
        ),
    async execute(interaction) {
        const startLevel = interaction.options.getInteger('start');
        const endLevel = interaction.options.getInteger('end');

        try {
            const { shardsNeeded, goldNeeded } = calculateResources(startLevel, endLevel);

            await interaction.reply(`Los recursos necesarios para subir tu unidad de nivel ${startLevel} a nivel ${endLevel} son: ${shardsNeeded} Shards, ${goldNeeded} Gold`);
        } catch (error) {
            await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
        }
    },
};
