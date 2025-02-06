const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const levels = require('../wildForest/levels.json'); // Ensure this points to the correct path
const { calculateResources } = require('../wildForest/calculateResources.js'); // Export the function
const fs = require('fs');
const path = require('path');

// Path to your static commands JSON file
const staticCommandsPath = path.join(__dirname, './exclamation/static.json');

// Load existing static commands
let staticCommands = {};
if (fs.existsSync(staticCommandsPath)) {
    staticCommands = JSON.parse(fs.readFileSync(staticCommandsPath, 'utf-8'));
}

// Allowed User IDs
let allowedUserIds = ['396392854798336002', '357087654552010753', '167821784333287424', '253329702662569987'];


module.exports = [
    // help 
    {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('Displays available commands'),
            async execute(interaction) {

                try {

                    // Respond to the interaction
                    await interaction.reply('Available commands: !time (utc time), !wf, !<cryptocurrency-short>, ?trophies, ?lords, ?partidas, ?levelup');
                } catch (error) {
                    await interaction.reply({ content: `Error: ${error.message}`, ephemeral: true });
                }
            },
    },
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

            if (!allowedUserIds.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: 'You are not authorized to use this command!',
                    ephemeral: true, // Ephemeral means only the user sees the message
                });
            }
            
            const commandName = interaction.options.getString('command');
            const commandResponse = interaction.options.getString('response');

            if(staticCommands[commandName]) {
                console.error('Command already exists');
                await interaction.reply(`Command !${commandName} already exists!`);
                return;
            } 
            // Add the new command to the static commands object
            staticCommands[commandName] = {
                description: 'Custom command added via /addcommand',
                command_response: commandResponse,
                console_log: `!${commandName} command called`,
            };

            // Save to the JSON file
            try {
                fs.writeFileSync(staticCommandsPath, JSON.stringify(staticCommands, null, 2), 'utf-8');
                await interaction.reply(`Command !${commandName} added successfully!`);
            } catch (error) {
                console.error('Error writing to staticCommands.json:', error);
                await interaction.reply('Failed to add the command. Please try again later.');
            }
        },
    },
    // delcommand
    {
        data: new SlashCommandBuilder()
            .setName('delcommand')
            .setDescription('Delete a static command')
            .addStringOption(option =>
                option.setName('command')
                    .setDescription('The command to delete')
                    .setRequired(true)),
        async execute(interaction) {

            if (!allowedUserIds.includes(interaction.user.id)) {
                return await interaction.reply({
                    content: 'You are not authorized to use this command!',
                    ephemeral: true, // Ephemeral means only the user sees the message
                });
            }

            const commandName = interaction.options.getString('command');

            if (!staticCommands[commandName]) {
                return await interaction.reply(`Command ${commandName} not found!`);
            }

            // Delete the command from the staticCommands object
            delete staticCommands[commandName];

            // Save the updated static commands to the JSON file
            fs.writeFileSync(staticCommandsPath, JSON.stringify(staticCommands, null, 2), 'utf-8');

            // Respond to the user
            await interaction.reply(`Command ${commandName} has been deleted!`);
        },
    },
    // listcommands
    {
        data: new SlashCommandBuilder()
            .setName('listcommands')
            .setDescription('Displays the list of static commands'),
        async execute(interaction) {
            // Reload static commands in case they were updated dynamically
            staticCommands = JSON.parse(fs.readFileSync(staticCommandsPath, 'utf-8'));

            // Prepare the list of commands
            const commandList = Object.keys(staticCommands)
                .map(command => `**!${command}**: ${staticCommands[command].description || 'No description provided'}`)
                .join('\n');

            if (!commandList) {
                return await interaction.reply('There are no static commands currently.');
            }

            // Reply with the list of static commands
            await interaction.reply({
                content: `Here's the list of commands:\n\n${commandList}`,
                ephemeral: true, // Optional: Only visible to the user who requested it
            });
        },
    },
];
