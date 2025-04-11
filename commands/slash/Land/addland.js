const { SlashCommandBuilder } = require('discord.js');
const database = require('@database');
// import allowList
const { allowList } = require('../handlers/slashCommands.js'); 
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addland")
        .setDescription("Add a Runiverse Land in the database.")
        .addStringOption(option =>
            option.setName("Type")
                .setDescription("Land Type to add e.g: Homestead")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("Zone")
                .setDescription("What's the Lands Zone e.g: Toadstool")
        .addStringOption(option =>
            option.setName("Blocked")
                .setDescription("Is the land Zone blocked? Yes or No.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("Resources")
                .setDescription("Resources gatherable in the land.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("Structures")
                .setDescription("Structures or Buildings in the land.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("City")
                .setDescription("The city the land is in (if it's in a city).")
                .setRequired(false))
        .addStringOption(option =>
            option.setName("District")
                .setDescription("The district the land is in.")
                .setRequired(false))
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
