require('module-alias/register');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
                ))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Filtrar por usuario')),

    async execute(interaction) {
        const filters = {
            land_id: interaction.options.getString('land_id'),
            user_id: interaction.options.getUser('user')?.id,
            type: interaction.options.getString('type'),
            zone: interaction.options.getString('zone'),
            city: interaction.options.getString('city'),
            district: interaction.options.getString('district'),
            resources: interaction.options.getString('resources'),
            structures: interaction.options.getString('structures'),
            blocked: interaction.options.getString('blocked')
        };

        const allEmpty = Object.values(filters).every(
            value => value == null || value.toString().trim() === ''
        );

        if (allEmpty) {
            return interaction.reply({
                content: '⚠️ Porfavor especifica al menos un parámetro de búsqueda.',
                flags: 64
            });
        }

        let query = 'SELECT * FROM Lands WHERE 1=1';
        const values = [];

        if (filters.land_id) {
            query += ' AND LOWER(land_id) = LOWER(?)';
            values.push(filters.land_id?.trim());
        }

        if (filters.user_id) {
            query += ' AND LOWER(user_id) = LOWER(?)';
            values.push(filters.user_id?.trim());
        }

        if (filters.type) {
            query += ' AND LOWER(type) = LOWER(?)';
            values.push(filters.type?.trim());
        }

        if (filters.zone) {
            query += ' AND LOWER(zone) = LOWER(?)';
            values.push(filters.zone?.trim());
        }

        if (filters.city) {
            query += ' AND LOWER(city) = LOWER(?)';
            values.push(filters.city?.trim());
        }

        if (filters.district) {
            query += ' AND LOWER(district) = LOWER(?)';
            values.push(filters.district?.trim());
        }

        if (filters.resources) {
            const normalizedResource = filters.resources.toLowerCase().trim().replace(/\s+/g, '');
            query += " AND FIND_IN_SET(?, REPLACE(LOWER(resources), ' ', ''))";
            values.push(normalizedResource);
        }

        if (filters.structures) {
            const normalizedStructure = filters.structures.toLowerCase().trim().replace(/\s+/g, '');
            query += " AND FIND_IN_SET(?, REPLACE(LOWER(structures), ' ', ''))";
            values.push(normalizedStructure);
        }



        if (filters.blocked !== null) {
            query += ' AND blocked = ?';
            values.push(filters.blocked === 'Sí' ? 1 : 0);
        }

        try {
            await interaction.deferReply({ flags: 64 });

            const [rows] = await database.query(query, values);

            if (rows.length === 0) {
                return await interaction.editReply('No se encontraron lands que coincidan con los filtros.');
            }

            await interaction.editReply('Aquí están las lands que buscaste:');

            for (const land of rows) {

                console.log(land.user_id);

                const embed = new EmbedBuilder()
                    .setTitle(`🌍 Land ID: ${land.land_id}`)
                    .setURL(`https://marketplace.roninchain.com/collections/forgotten-runiverse-real-estate/${land.land_id}`)
                    .setColor('#4e5d94')
                    .setDescription(`👤 Propietario: <@${land.user_id}>`)
                    .addFields(
                        { name: '🏷️ Tipo', value: land.type || 'Sin dato', inline: true },
                        { name: '🌐 Zona', value: land.zone || 'Sin dato', inline: true },
                        { name: '🚫 Bloqueada', value: land.blocked ? 'Sí' : 'No', inline: true },
                        { name: '🏙️ Ciudad', value: land.city || 'Sin dato', inline: true },
                        { name: '📍 Distrito', value: land.district || 'Sin dato', inline: true },
                        { name: '💎 Recursos', value: land.resources?.split(',').map(r => `• ${r.trim()}`).join('\n') || '• Ninguno', inline: false },
                        { name: '🏗️ Estructuras', value: land.structures?.split(',').map(s => `• ${s.trim()}`).join('\n') || '• Ninguna', inline: false },
                        { name: '🔗 Marketplace', value: `[Ver en el marketplace](https://marketplace.roninchain.com/collections/forgotten-runiverse-real-estate/${land.land_id})`, inline: false }
                    )
                    .setFooter({ text: `LandsInfo • ${new Date().toUTCString()}` });

                await interaction.followUp({ embeds: [embed], flags: 64 });
            }

        } catch (err) {
            console.error(err);
            await interaction.reply('Ocurrió un error al buscar las lands.');
        }
    },
};
