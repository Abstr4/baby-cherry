require('module-alias/register');
const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
const { allowList } = require('@root/commands/handlers/slashCommands.js');
const { sendNoPermissionMessage, isAdmin } = require('@helpers');
const { sendEphemeralMessage } = require('@messageService');

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
            if (!isAdmin(interaction)) {
                return sendNoPermissionMessage(interaction);
            }
            const user = interaction.options.getUser('user');

            // Check if the user is already allowed
            const [rows] = await database.execute("SELECT 1 FROM Allowlist WHERE user_id = ?", [user.id]);
            if (rows.length > 0) {
                return sendEphemeralMessage(interaction, `${user} is already in the allowlist.`);
            }

            // Add it
            await database.execute("INSERT IGNORE INTO Allowlist (user_id) VALUES (?)", [user.id]);
            allowList.add(user.id);

            return sendEphemeralMessage(interaction, `${user} is now allowed to use commands!`);
        }
        catch (error) {
            console.error(error);
            return sendEphemeralMessage(interaction, "An error occurred while allowing the user.");
        }
    }
};
