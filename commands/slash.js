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
    // delcommand
    {
        data: new SlashCommandBuilder()
        .setName("delcommand")
        .setDescription("Deletes an existing command from the bot.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("The command to delete (e.g., !hello)")
                .setRequired(true)),
        
        async execute(interaction) {
            const userId = interaction.user.id;
            const member = interaction.member;
            const command = interaction.options.getString("command");

            // Ensure command starts with "!"
            if (!command.startsWith("!")) {
                return interaction.reply({ content: "❌ Commands must start with `!`. Example: `!hello`", ephemeral: true });
            }
            // Permission check
            if (
                member.permissions.has(PermissionFlagsBits.Administrator) ||
                allowedUsers.includes(userId)
            ) {
                connection.query(
                    "DELETE FROM ExclamationCommands WHERE Command = ?",
                    [command],
                    (err, result) => {
                        if (err) {
                            console.error("❌ Database error:", err);
                            return interaction.reply({ content: "❌ Failed to delete command!", ephemeral: true });
                        }
                        if (result.affectedRows === 0) {
                            return interaction.reply({ content: `❌ Command **${command}** not found!`, ephemeral: true });
                        }
                        interaction.reply({ content: `✅ Command **${command}** deleted successfully!`, ephemeral: true });
                    }
                );
            } else {
                interaction.reply({ content: "❌ You do not have permission to use this command!", ephemeral: true });
            } 
        }
    },
    // addreminder
    {
        data: new SlashCommandBuilder()
        .setName("addreminder")
        .setDescription("Set a reminder for everyone.")
        .addStringOption(option =>
            option.setName("date")
                .setDescription("Date and time (YYYY-MM-DD HH:mm) in UTC.")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("Reminder message.")
                .setRequired(true))
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to send the reminder (optional)")
                .setRequired(false)),

        async execute(interaction) {
            const dateStr = interaction.options.getString("date");
            const message = interaction.options.getString("message");
            const channel = interaction.options.getChannel("channel") || interaction.channel;
            const channelId = channel.id;

            // Validate date format
            const remindAt = moment.utc(dateStr, "YYYY-MM-DD HH:mm", true);
            if (!remindAt.isValid()) {
                return interaction.reply({
                    content: "❌ Invalid date format. Use `YYYY-MM-DD HH:mm` in UTC.",
                    ephemeral: true
                });
            }

            // Store in database
            connection.query(
                "INSERT INTO Reminders (Message, RemindAt, ChannelId) VALUES (?, ?, ?)",
                [message, remindAt.format("YYYY-MM-DD HH:mm:ss"), channelId],
                (err) => {
                    if (err) {
                        console.error("❌ Database error:", err);
                        return interaction.reply({ content: "❌ Failed to save reminder.", ephemeral: true });
                    }
                    interaction.reply({
                        content: `✅ Reminder set for <t:${Math.floor(remindAt.unix())}:F> in <#${channelId}>.`,
                        ephemeral: false
                    });
                }
            );
        }
    }
];
