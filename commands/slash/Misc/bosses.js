require('module-alias/register');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Boss list grouped by difficulty
const bossesByDifficulty = {
    Normal: [
        { name: '☣️ Toxspore', interval: 6, start_time: '07:20' },
        { name: '🏜️ Bristol', interval: 6, start_time: '08:25' },
        { name: '🦇 Veilian', interval: 8, start_time: '07:30' },
        { name: '⚡ Arque', interval: 8, start_time: '08:35' },
        { name: '🔥 Rootrus', interval: 10, start_time: '07:40' },
        { name: '🔮 Sapphire', interval: 10, start_time: '08:45' },
        { name: '🌊 Coralisk', interval: 12, start_time: '07:50' },
        { name: '🍃 Breeze', interval: 12, start_time: '08:55' }
    ],
    Hard: [
        { name: '💧 Blumens', interval: 12, start_time: '05:30' },
        { name: '🥕 Betalanse', interval: 12, start_time: '07:30' },
        { name: '🧊 Cryo', interval: 12, start_time: '09:30' },
        { name: '🍄 Sporelex', interval: 12, start_time: '11:20' },
        { name: '☣️ Toxspore', interval: 12, start_time: '13:20' },
        { name: '🏜️ Bristol', interval: 12, start_time: '15:20' },
        { name: '🦇 Veilian', interval: 12, start_time: '17:20' },
        { name: '⚡ Arque', interval: 12, start_time: '19:20' },
        { name: '🔥 Rootrus', interval: 12, start_time: '21:20' },
        { name: '🔮 Sapphire', interval: 12, start_time: '23:20' },
        { name: '🌊 Coralisk', interval: 12, start_time: '01:20' },
        { name: '🍃 Breeze', interval: 12, start_time: '03:20' }
    ],
};

// Parse 'HH:mm' to a UNIX timestamp for today
function getTodayStartTimestamp(startTimeStr) {
    const now = new Date();
    const [hours, minutes] = startTimeStr.split(':').map(Number);

    const utcDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0
    ));

    return Math.floor(utcDate.getTime() / 1000);
}

// Calculate next spawn based on today's start time
function getNextSpawn(startTimeStr, intervalHours) {
    const startTime = getTodayStartTimestamp(startTimeStr);
    const now = Math.floor(Date.now() / 1000);
    const intervalSecs = intervalHours * 3600;

    let nextSpawn = startTime;
    while (nextSpawn < now) {
        nextSpawn += intervalSecs;
    }

    return nextSpawn;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bosses')
        .setDescription('Displays the next spawn time for all bosses by difficulty'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('☠️ Field Boss Spawn Times ⏳')
            .setColor(0x00b0f4)
            .setTimestamp();

        for (const [difficulty, bosses] of Object.entries(bossesByDifficulty)) {
            let fieldValue = '';

            for (const boss of bosses) {
                const nextSpawn = getNextSpawn(boss.start_time, boss.interval);
                fieldValue += `**${boss.name}**: <t:${nextSpawn}:R>\n`;
            }

            embed.addFields({ name: `${difficulty} Mode`, value: fieldValue });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
