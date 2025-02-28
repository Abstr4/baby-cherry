require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("allow")
        .setDescription("Allow a user to use commands.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to allow")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");

        try {
            await database.query("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);
            allowlist.add(user.id); // Update in-memory list

            await interaction.reply({ content: `${user.username} is now allowed to use commands!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "An error occurred while allowing the user.", ephemeral: true });
        }
    }
};
