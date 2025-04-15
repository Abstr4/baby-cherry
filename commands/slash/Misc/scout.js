const { SlashCommandBuilder } = require("discord.js");
const database = require("@database");

const gradeDurations = {
    common: 2,
    rare: 4,
    epic: 8,
    legendary: 12,
    mythic: 16,
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("scout")
        .setDescription("Start a scout and get notified when it ends.")
        .addStringOption(option =>
            option.setName("grade")
                .setDescription("Scout grade")
                .setRequired(true)
                .addChoices(
                    { name: "Common", value: "common" },
                    { name: "Rare", value: "rare" },
                    { name: "Epic", value: "epic" },
                    { name: "Legendary", value: "legendary" },
                    { name: "Mythic", value: "mythic" }
                )
        ),

    async execute(interaction) {
        const grade = interaction.options.getString("grade");
        const duration = gradeDurations[grade];

        if (!duration) {
            await interaction.reply({ content: "❌ Invalid scout grade.", flags: 64 });
            return;
        }

        const now = new Date();
        const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);

        try {
            await database.insertScout(interaction.user.id, grade, endTime);
            await interaction.reply({
                content: `🕵️ Scout of grade **${grade}** started. You’ll be notified in ${duration} hours.`,
                flags: 64
            });
        } catch (error) {
            console.error("❌ Error inserting scout:", error);
            await interaction.reply({ content: "❌ Failed to register scout.", flags: 64 });
        }
    }
};
