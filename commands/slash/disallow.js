require('module-alias/register');
const database = require('@database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("disallow")
        .setDescription("Remove a user from the allowlist, preventing them from using commands.")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("User to disallow")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");

        try {
            const [result] = await database.query("DELETE FROM Allowlist WHERE user_id = ?", [user.id]);

            if (result.affectedRows === 0) {
                return interaction.reply({ content: `${user.username} is not in the allowlist.`, ephemeral: true });
            }

            allowlist.delete(user.id); // Update in-memory list

            await interaction.reply({ content: `${user.username} has been removed from the allowlist.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "An error occurred while disallowing the user.", ephemeral: true });
        }
    }
};
