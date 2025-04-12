require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('reminders')
      .setDescription('Lista todos los recordatorios configurados'),
  
    async execute(interaction) {
      const [reminders] = await database.query("SELECT * FROM Reminder ORDER BY time");
  
      if (reminders.length === 0)
        return await interaction.reply({ content: 'No hay recordatorios configurados.', flags: 64 });
  
      const embeds = [];
      let currentDescription = '';
      let page = 1;
  
      for (let i = 0; i < reminders.length; i++) {
        const r = reminders[i];
        const line = `ID: \`${r.id}\` | ${r.message}\n`;
  
        if (currentDescription.length + line.length > 4000) {
          embeds.push(
            new EmbedBuilder()
              .setTitle('📅 Lista de Recordatorios')
              .setColor('#4e5d94')
              .setDescription(currentDescription)
              .setFooter({ text: `Página ${page}` })
          );
  
          currentDescription = '';
          page++;
        }
  
        currentDescription += line;
      }
  
      if (currentDescription) {
        embeds.push(
          new EmbedBuilder()
            .setTitle('📅 Lista de Recordatorios')
            .setColor('#4e5d94')
            .setDescription(currentDescription)
            .setFooter({ text: `Página ${page}` })
        );
      }
  
      await interaction.reply({ embeds: [embeds[0]], flags: 64 });
  
      for (let i = 1; i < embeds.length; i++) {
        await interaction.followUp({ embeds: [embeds[i]], flags: 64 });
      }
    }
  };