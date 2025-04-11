const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('@database');
const { allowList } = require('../../handlers/slashCommands.js');

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
            // Check if the user has Administrator permission
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: "❌ You do not have permission to use this command.",
                    ephemeral: true,
                });
            }
            const user = interaction.options.getUser('user');

            // Check if the user is already allowed
            const [rows] = await database.execute("SELECT 1 FROM Allowlist WHERE user_id = ?", [user.id]);
            if (rows.length > 0) {
                return interaction.reply({ content: `${user} is already in the allowlist.`, flags: 64 });
            }

            // Add it
            await database.execute("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);

            allowList.add(user.id); // Ensure allowlist is updated

            return interaction.reply({ content: `${user.username} is now allowed to use commands!`, flags: 64 });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "An error occurred while allowing the user.", flags: 64 });
        }
    }
};
