require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('Lists all exclamation commands (!commands) from the database'),

  async execute(interaction) {
    try {
      const [rows] = await database.execute("SELECT Command, Response FROM ExclamationCommand");

      if (rows.length === 0) {
        return interaction.reply({ content: 'No exclamation commands found.', flags: 64 });
      }

      const embeds = [];
      let current = '';
      let page = 1;

      for (let i = 0; i < rows.length; i++) {
        const line = `**!${rows[i].Command}** → ${rows[i].Response}\n`;

        if (current.length + line.length > 4000) {
          embeds.push(new EmbedBuilder()
            .setTitle('📃 Lista de !commands')
            .setColor('#5865F2')
            .setDescription(current)
            .setFooter({ text: `Página ${page}` }));

          current = '';
          page++;
        }

        current += line;
      }

      if (current) {
        embeds.push(new EmbedBuilder()
          .setTitle('📃 Lista de !commands')
          .setColor('#5865F2')
          .setDescription(current)
          .setFooter({ text: `Página ${page}` }));
      }

      await interaction.reply({ embeds: [embeds[0]], flags: 64 });

      for (let i = 1; i < embeds.length; i++) {
        await interaction.followUp({ embeds: [embeds[i]], flags: 64 });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ An error occurred while retrieving the command list.',
        flags: 64
      });
    }
  }
};