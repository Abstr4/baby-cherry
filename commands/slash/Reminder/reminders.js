require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { sendEphemeralMessage } = require('@messageService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminders')
        .setDescription('Lista todos los recordatorios configurados'),

    async execute(interaction) {
        const [reminders] = await database.query("SELECT * FROM Reminder ORDER BY ID");

        if (reminders.length === 0) {
            return sendEphemeralMessage(interaction, 'No hay recordatorios configurados.');
        }
        const embeds = [];
        let currentDescription = '';
        let page = 1;

        for (let i = 0; i < reminders.length; i++) {
            const r = reminders[i];

            const [hours, minutes] = r.Time.split(":").map(Number);
            const now = new Date();
            const scheduled = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes));
            const timestamp = Math.floor(scheduled.getTime() / 1000);
            const line = `ID: \`${r.ID}\` | ⏰ <t:${timestamp}:R> | ${r.Message}\n`;


            if (currentDescription.length + line.length > 4000) {
                embeds.push(
                    new EmbedBuilder()
                        .setTitle('📅 Lista de Recordatorios')
                        .setColor('#4e5d94')
                        .setDescription(currentDescription)
                        .setFooter({ text: `Página ${page}` })
                );
                currentDescription = '';
                page++;
            }
            currentDescription += line;
        }
        if (currentDescription) {
            embeds.push(
                new EmbedBuilder()
                    .setTitle('📅 Lista de Recordatorios')
                    .setColor('#4e5d94')
                    .setDescription(currentDescription)
                    .setFooter({ text: `Página ${page}` })
            );
        }
        await interaction.reply({ embeds: [embeds[0]], flags: 64 });
        for (let i = 1; i < embeds.length; i++) {
            await interaction.followUp({ embeds: [embeds[i]], flags: 64 });
        }
    }
};