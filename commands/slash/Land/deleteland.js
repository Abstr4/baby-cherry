require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteland")
        .setDescription("Eliminar una land.")
        .addStringOption(option =>
            option.setName("land_id")
                .setDescription("ID de la land a eliminar")
                .setRequired(true)
        ),

    async execute(interaction) {
        const landId = interaction.options.getString("land_id").trim();
        const userId = interaction.user.id;

        const [result] = await database.query(
            "DELETE FROM lands WHERE land_id = ? AND user_id = ?",
            [landId, userId]
        );

        if (result.affectedRows === 0) {
            return await interaction.reply({
                content: "❌ No se encontró ninguna land con ese ID asociada a tu usuario.",
                ephemeral: true
            });
        }

        await interaction.reply(`🗑️ Land con ID \`${landId}\` eliminada correctamente.`);
    }
};
