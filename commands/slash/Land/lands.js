require('module-alias/register');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require("@database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('landsinfo')
        .setDescription('Resumen general de todas las lands registradas'),

    async execute(interaction) {
        try {
            const [lands] = await database.query("SELECT * FROM Lands");

            const totalLands = lands.length;
            const blockedLands = lands.filter(l => l.blocked).length;
            const uniqueOwners = new Set(lands.map(l => l.owner)).size;

            const resourceCounts = {};
            const structureCounts = {};

            // Land type counters
            const landTypeCounts = {
                Homestead: 0,
                Settlement: 0,
                City: 0,
                Village: 0
            };

            // Function to validate entries (only allows letters, commas, and spaces, no numbers)
            const isValidEntry = entry => {
                const trimmed = entry.trim();
                return trimmed && trimmed !== "-" && /^[A-Za-z\s,]+$/.test(trimmed);
            };

            for (const land of lands) {
                const resources = land.resources?.split(',') || [];
                const structures = land.structures?.split(',') || [];

                // Count land types
                if (land.type in landTypeCounts) {
                    landTypeCounts[land.type]++;
                }

                // Validate and process resources
                for (const r of resources) {
                    const trimmed = r.trim();
                    if (!isValidEntry(trimmed)) continue;
                    resourceCounts[trimmed] = (resourceCounts[trimmed] || 0) + 1;
                }

                // Validate and process structures
                for (const s of structures) {
                    const trimmed = s.trim();
                    if (!isValidEntry(trimmed)) continue;
                    structureCounts[trimmed] = (structureCounts[trimmed] || 0) + 1;
                }
            }

            const formatCounts = obj =>
                Object.entries(obj)
                    .map(([key, val]) => `• **${key}**: ${val}`)
                    .join('\n') || '• None';

            // Format land types as a single line: Homesteads: 4, Settlements: 8, etc.
            const landTypeSummary = `• **Homesteads**: ${landTypeCounts.Homestead}, ` +
                                    `**Settlements**: ${landTypeCounts.Settlement}, ` +
                                    `**Cities**: ${landTypeCounts.City}, ` +
                                    `**Villages**: ${landTypeCounts.Village}`;

            const embed = new EmbedBuilder()
                .setTitle('⛩️ DOJO Lands Overview 📊')
                .setColor('#4e5d94')
                .addFields(
                    { name: 'Resumen', value: `• Total Lands: **${totalLands}**\n• Unique Owners: **${uniqueOwners}**\n• Blocked Lands: **${blockedLands}**`, inline: false },
                    { name: '💎 Resources', value: formatCounts(resourceCounts), inline: true },
                    { name: '🏗️ Structures', value: formatCounts(structureCounts), inline: true },
                    { name: '🏡 Land Types', value: landTypeSummary, inline: false }
                )
                .setFooter({ text: `LandsInfo - Actualizado al ${new Date().toLocaleDateString()}` });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Hubo un error al obtener la información de lands.', flags: 64 });
        }
    }
};
