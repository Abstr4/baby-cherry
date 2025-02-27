require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reminders')
        .setDescription('Lists all reminders from the database'),

    async execute(interaction) {
        try {
            const [rows] = await database.execute("SELECT ID, Message, ReminderAt, ChannelId, RoleId FROM Reminder");

            if (rows.length === 0) {
                return interaction.reply({ content: 'No reminders found.', flags: 64 });
            }

            const reminderList = rows.map(reminder => 
                `• **ID:** ${reminder.ID} | **${reminder.Message}** - <t:${Math.floor(new Date(reminder.ReminderAt).getTime() / 1000)}:F> ` +
                `in <#${reminder.ChannelId}> ${reminder.RoleId ? `for <@&${reminder.RoleId}>` : ""}`
            ).join('\n');

            await interaction.reply({ content: reminderList, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while retrieving the reminders.', flags: 64 });
        }
    }
};
