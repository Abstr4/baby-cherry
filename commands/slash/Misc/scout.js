require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment');
const { insertScout, countScoutsByUser } = require('@root/services/scoutService.js');

const SCOUT_DURATIONS = {
    common: 2 * 60 * 60,       // 2 hour
    rare: 4 * 60 * 60,     // 4 hours
    epic: 8 * 60 * 60,     // 8 hours
    legendary: 12 * 60 * 60 // 12 hours
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scout")
        .setDescription("Start a scout timer based on grade.")
        .addStringOption(option =>
            option.setName("grade")
                .setDescription("Scout grade")
                .setRequired(true)
                .addChoices(
                    { name: 'Common', value: 'common' },
                    { name: 'Rare', value: 'rare' },
                    { name: 'Epic', value: 'epic' },
                    { name: 'Legendary', value: 'legendary' }
                )
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const grade = interaction.options.getString("grade");

        const durationSeconds = SCOUT_DURATIONS[grade];
        const endsAtUnix = Math.floor(Date.now() / 1000) + durationSeconds;
        const endsAt = moment.unix(endsAtUnix).utc();

        try {
            const currentCount = await countScoutsByUser(userId);
            if (currentCount >= 5) {
                return interaction.reply({
                    content: "❌ You already have 5 scouts active. Delete one before adding another.",
                    flags: 64
                });
            }
            await insertScout(userId, grade, endsAt.format("YYYY-MM-DD HH:mm:ss"));

            await interaction.reply({
                content: `✅ Scout of grade **${grade}** will end at <t:${endsAt.unix()}:F> (${endsAt.format("YYYY-MM-DD HH:mm")} UTC).`,
                flags: 64
            });
        } catch (err) {
            console.error("❌ Exception Raised: Error inserting scout:", err);
            return interaction.reply({
                content: "❌ Failed to save scout timer.",
                flags: 64
            });
        }
    }
};
