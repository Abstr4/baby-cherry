const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');

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
        try {
            const user = interaction.options.getUser("user");
            await database.execute("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);

            allowlist.add(user.id); // Ensure allowlist is updated

            return interaction.reply({ content: `${user.username} is now allowed to use commands!`, flags: 64 });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while allowing the user.", flags: 64 });
        }
    }
};
