require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const moment = require('moment');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editreminder')
        .setDescription('Edita un recordatorio por ID')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID del recordatorio a editar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('hora')
                .setDescription('Nueva hora en formato HH:mm (UTC)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Nuevo mensaje del recordatorio')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('offsetminutes')
                .setDescription('Minutos para ajustar el timestamp (opcional)')
                .setRequired(false)
                .setMinValue(1) // Ensures offsetMinutes is >= 1
                .setMaxValue(10)), // Ensures offsetMinutes is <= 10

    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const timeStr = interaction.options.getString('hora');
        const message = interaction.options.getString('mensaje');
        const offsetMinutes = interaction.options.getInteger('offsetminutes') || null; // If no offset is provided, it's null

        // Validate time format with moment
        const remindAt = moment.utc(timeStr, "HH:mm", true);
        if (!remindAt.isValid()) {
            return sendEphemeralMessage(interaction, "❌ Invalid time format. Use `HH:mm` in UTC.");
        }

        try {
            // Update the reminder in the database with the new time and message
            const [result] = await database.query(
                "UPDATE Reminders SET time = ?, message = ?, offsetMinutes = ? WHERE id = ?",
                [timeStr, message, offsetMinutes, id]
            );

            if (result.affectedRows === 0) {
                return sendEphemeralMessage(interaction, `❌ No se encontró un recordatorio con ID ${id}.`);
            }

            // Send response with updated reminder details
            const timeFormatted = moment.utc(timeStr, "HH:mm").format("HH:mm");
            const responseMessage = `✅ Recordatorio #${id} actualizado para **${timeFormatted} UTC**. ${message}`;

            // If offsetMinutes is greater than 0, mention the timestamp
            const formattedMessage = offsetMinutes && offsetMinutes > 0
                ? `${responseMessage} El recordatorio aparecerá en **${offsetMinutes} minuto${offsetMinutes === 1 ? '' : 's'}**.`
                : responseMessage;

            return sendEphemeralMessage(interaction, formattedMessage);

        } catch (err) {
            console.error("❌ Database error:", err);
            return sendEphemeralMessage(interaction, "❌ Failed to update reminder.");
        }
    }
};
