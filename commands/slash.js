const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { calculateResources } = require('../wildForest/calculateResources.js'); // Export the function
const connection = require('./database');

// Allowed User IDs
let allowedUserIds = ['396392854798336002', '357087654552010753', '167821784333287424', '253329702662569987'];


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
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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

            if (!allowedUserIds.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: 'You are not authorized to use this command!',
                    ephemeral: true, // Ephemeral means only the user sees the message
                });
            }
            
            const commandName = interaction.options.getString('command');
            const commandResponse = interaction.options.getString('response');

            // Validate command format (must start with "!" and contain only letters)
            if (!/^![a-zA-Z]+$/.test(commandName)) {
                return await interaction.reply({
                    content: 'Invalid command format! Commands must start with "!" and contain only letters (no spaces, numbers, or symbols).',
                    ephemeral: true,
                });
            }
            
            // Check if the command already exists in the database
            connection.query(
                'SELECT * FROM exclamationCommands WHERE command_name = ?',
                [commandName],
                (err, results) => {
                    if (err) {
                        console.error('❌ Database query error:', err);
                        return interaction.reply('Database error occurred. Please try again later.');
                    }

                    if (results.length > 0) {
                        return interaction.reply(`Command ${commandName} already exists!`);
                    }

                    // Insert the new command into the database
                    connection.query(
                        'INSERT INTO exclamationCommands (command_name, response) VALUES (?, ?)',
                        [commandName, commandResponse],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('❌ Error inserting command:', insertErr);
                                return interaction.reply('Failed to add the command. Please try again.');
                            }

                            interaction.reply(`✅ Command ${commandName} added successfully!`);
                        }
                    );
                }
            );
        },
    },
];
