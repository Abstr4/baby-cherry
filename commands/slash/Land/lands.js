require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('lands')
    .setDescription('Busca lands por distintos campos.')

    .addStringOption(option =>
      option.setName('land_id')
        .setDescription('ID de la land'))

    .addStringOption(option =>
      option.setName('type')
        .setDescription('Tipo de land')
        .addChoices(
          { name: 'Homestead', value: 'Homestead' },
          { name: 'Settlement', value: 'Settlement' },
          { name: 'City', value: 'City' },
          { name: 'Village', value: 'Village' }
        ))

    .addStringOption(option =>
      option.setName('zone')
        .setDescription('Zona'))

    .addStringOption(option =>
      option.setName('city')
        .setDescription('Ciudad'))

    .addStringOption(option =>
      option.setName('district')
        .setDescription('Distrito'))

    .addStringOption(option =>
      option.setName('resources')
        .setDescription('Filtrar por recursos'))

    .addStringOption(option =>
      option.setName('structures')
        .setDescription('Filtrar por estructuras'))

    .addStringOption(option =>
      option.setName('blocked')
        .setDescription('¿Está bloqueada? (Sí / No)')
        .addChoices(
          { name: 'Sí', value: 'Sí' },
          { name: 'No', value: 'No' }
        )),

  async execute(interaction) {
    const filters = {
      land_id: interaction.options.getString('land_id'),
      type: interaction.options.getString('type'),
      zone: interaction.options.getString('zone'),
      city: interaction.options.getString('city'),
      district: interaction.options.getString('district'),
      resources: interaction.options.getString('resources'),
      structures: interaction.options.getString('structures'),
      blocked: interaction.options.getString('blocked')
    };

    let query = 'SELECT * FROM lands WHERE 1=1';
    const values = [];

    if (filters.land_id) {
      query += ' AND land_id = ?';
      values.push(filters.land_id);
    }
    if (filters.type) {
      query += ' AND type LIKE ?';
      values.push(`%${filters.type}%`);
    }
    if (filters.zone) {
      query += ' AND zone LIKE ?';
      values.push(`%${filters.zone}%`);
    }
    if (filters.city) {
      query += ' AND city LIKE ?';
      values.push(`%${filters.city}%`);
    }
    if (filters.district) {
      query += ' AND district LIKE ?';
      values.push(`%${filters.district}%`);
    }
    if (filters.resources) {
      query += ' AND resources LIKE ?';
      values.push(`%${filters.resources}%`);
    }
    if (filters.structures) {
      query += ' AND structures LIKE ?';
      values.push(`%${filters.structures}%`);
    }
    if (filters.blocked !== null) {
      query += ' AND blocked = ?';
      values.push(filters.blocked ? 1 : 0);
    }

    try {
      const [rows] = await database.query(query, values);

      if (rows.length === 0) {
        console.log('No se encontraron lands que coincidan con los filtros.');
        return interaction.reply('No se encontraron lands que coincidan con los filtros.');
      }

      const response = rows.map(l =>
        `**Land ID:** ${l.land_id}\n**Tipo:** ${l.type}\n**Zona:** ${l.zone}\n**Bloqueada:** ${l.blocked ? 'Sí' : 'No'}\n**Ciudad:** ${l.city}\n**Distrito:** ${l.district}\n**Recursos:** ${l.resources}\n**Estructuras:** ${l.structures}`
      ).join('\n\n');

      await interaction.reply(response.length > 2000 ? response.slice(0, 1997) + '...' : response);

    } catch (err) {
      console.error(err);
      await interaction.reply('Ocurrió un error al buscar las lands.');
    }
  },
};
