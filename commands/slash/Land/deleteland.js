require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { sendEphemeralMessage } = require('@messageService');

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
            "DELETE FROM Lands WHERE land_id = ? AND user_id = ?",
            [landId, userId]
        );

        if (result.affectedRows === 0) {
            return sendEphemeralMessage(interaction, "❌ No se encontró ninguna land con ese ID asociada a tu usuario.");
        }
        return sendEphemeralMessage(interaction, `🗑️ Land con ID \`${landId}\` eliminada correctamente.`);
    }
};
