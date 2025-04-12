require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('editreminder')
      .setDescription('Edita un recordatorio por ID')
      .addIntegerOption(option =>
        option.setName('id')
          .setDescription('ID del recordatorio a editar')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('hora')
          .setDescription('Nueva hora en formato HH:mm (UTC)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('mensaje')
          .setDescription('Nuevo mensaje del recordatorio')
          .setRequired(true)),
  
    async execute(interaction) {
      const id = interaction.options.getInteger('id');
      const timeStr = interaction.options.getString('hora');
      const message = interaction.options.getString('mensaje');
  
      // Validación estricta con moment
      const remindAt = moment.utc(timeStr, "HH:mm", true);
      if (!remindAt.isValid()) {
        return interaction.reply({
          content: "❌ Invalid time format. Use `HH:mm` in UTC.",
          flags: 64
        });
      }
  
      const [result] = await database.query(
        "UPDATE Reminders SET time = ?, message = ? WHERE id = ?",
        [timeStr, message, id]
      );
  
      if (result.affectedRows === 0) {
        return interaction.reply({ content: `❌ No se encontró un recordatorio con ID ${id}.`, flags: 64 });
      }
  
      await interaction.reply({ content: `✅ Recordatorio #${id} actualizado.`, flags: 64 });
    }
  };