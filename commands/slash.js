const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { calculateResources } = require('../wildForest/calculateResources.js'); // Export the function
const connection = require('../database.js');

// Allowed User IDs
let allowedUsers = ['396392854798336002', '357087654552010753', '167821784333287424', '253329702662569987'];

module.exports = [
    // levelup 
    {
        data: new SlashCommandBuilder()
            .setName('levelup')
            .setDescription('Calculate the resources needed to level up')
            .addIntegerOption(option =>
                option
                    .setName('start')
                    .setDescription('The starting level')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('end')
                    .setDescription('The ending level')
                    .setRequired(true)
            ),
            async execute(interaction) {
                const startLevel = interaction.options.getInteger('start');
                const endLevel = interaction.options.getInteger('end');

                try {
                    const { shardsNeeded, goldNeeded } = calculateResources(startLevel, endLevel);

                    // Respond to the interaction
                    await interaction.reply(`Los recursos necesarios para subir tu unidad de nivel ${startLevel} a nivel ${endLevel} son: ${shardsNeeded} Shards, ${goldNeeded} Gold`);
                } catch (error) {
                    await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
                }
            },
    },
    // addcommand 
    {
        // use .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) to allow only admins to addcommands
        data: new SlashCommandBuilder()
            .setName('addcommand')
            .setDescription('Add a static exclamation command')
            .addStringOption(option =>
                option
                    .setName('command')
                    .setDescription('The exclamation command name (e.g., !hello)')
                    .setRequired(true))
            .addStringOption(option =>
                option
                    .setName('response')
                    .setDescription('The response of the command')
                    .setRequired(true)),

        async execute(interaction) {
            const userId = interaction.user.id; // Get the user's Discord ID
            const member = interaction.member; // Get member info
    
            // Check if the user is an admin or in the allow list
            if (
                member.permissions.has(PermissionFlagsBits.Administrator) ||
                allowedUsers.includes(userId)
            ) {
                const command = interaction.options.getString("command");
                const response = interaction.options.getString("response");
    
                // Add command to the database
                connection.query(
                    "INSERT INTO ExclamationCommands (Command, Response) VALUES (?, ?)",
                    [command, response],
                    (err) => {
                        if (err) {
                            console.error("❌ Database error:", err);
                            return interaction.reply({ content: "❌ Failed to add command!", ephemeral: true });
                        }
                        interaction.reply({ content: `✅ Command **${command}** added successfully!`, ephemeral: true });
                    }
                );
            } else {
                interaction.reply({ content: "❌ You do not have permission to use this command!", ephemeral: true });
            }
        },
    },
];
