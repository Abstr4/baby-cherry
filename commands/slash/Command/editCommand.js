require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

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
        return interaction.reply({
          content: `❌ No command found with name \`!${commandName}\`.`,
          flags: 64
        });
      }

      await interaction.reply({
        content: `✅ Command \`!${commandName}\` updated successfully.`,
        flags: 64
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ An error occurred while updating the command.',
        flags: 64
      });
    }
  }
};
