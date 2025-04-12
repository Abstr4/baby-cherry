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
            const homesteadCount = { Homestead: 0, Settlement: 0, City: 0, Village: 0 };

            for (const land of lands) {
                const resources = land.resources?.split(',') || [];
                const structures = land.structures?.split(',') || [];

                // Count resources
                for (const r of resources) {
                    const trimmed = r.trim();
                    if (!trimmed) continue;
                    resourceCounts[trimmed] = (resourceCounts[trimmed] || 0) + 1;
                }

                // Count structures
                for (const s of structures) {
                    const trimmed = s.trim();
                    if (!trimmed) continue;
                    structureCounts[trimmed] = (structureCounts[trimmed] || 0) + 1;
                }

                // Count types of lands
                if (land.type in homesteadCount) {
                    homesteadCount[land.type] += 1;
                }
            }

            const formatCounts = (obj) =>
                Object.entries(obj)
                    .map(([key, val]) => `• **${key}**: ${val}`)
                    .join('\n') || '• None';

            const embed = new EmbedBuilder()
                .setTitle('⛩️ DOJO Lands Overview 📊')
                .setColor('#4e5d94')
                .addFields(
                    { name: 'Resumen', value: `• Total Lands: **${totalLands}**\n• Unique Owners: **${uniqueOwners}**\n• Blocked Lands: **${blockedLands}**`, inline: false },
                    { name: '💎 Resources', value: formatCounts(resourceCounts), inline: true },
                    { name: '🏗️ Structures', value: formatCounts(structureCounts), inline: true },
                    { name: '🏠 Land Types', value: `• Homesteads: **${homesteadCount.Homestead}**\n• Settlements: **${homesteadCount.Settlement}**\n• Cities: **${homesteadCount.City}**\n• Villages: **${homesteadCount.Village}**`, inline: false }
                )
                .setFooter({ text: `LandsInfo - Actualizado al ${new Date().toLocaleDateString()}` });

            // Ensure the message is sent properly
            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Hubo un error al obtener la información de lands.', flags: 64 });
        }
    }
};
