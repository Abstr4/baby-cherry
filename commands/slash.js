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
        .setDescription("Set a global reminder for everyone at a specific date and time.")
        .addStringOption(option =>
            option.setName("date")
                .setDescription("The date and time for the reminder (YYYY-MM-DD HH:mm UTC)")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to be sent at the specified time")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {
            if (!allowedUsers.includes(interaction.user.id)) {
                return interaction.reply({ content: "❌ You are not allowed to use this command.", ephemeral: true });
            }

            const ChannelId = interaction.channel.id;
            const dateString = interaction.options.getString("date");
            const Message = interaction.options.getString("message");

            // Validate date format
            const RemindAt = moment(dateString, "YYYY-MM-DD HH:mm", true);
            if (!RemindAt.isValid()) {
                return interaction.reply({ content: "❌ Invalid date format! Use `YYYY-MM-DD HH:mm` in UTC time.", ephemeral: true });
            }

            // Store the global reminder in the database
            connection.query(
                "INSERT INTO GlobalReminders (ChannelId, Message, RemindAt) VALUES (?, ?, ?)",
                [ChannelId, Message, RemindAt.format("YYYY-MM-DD HH:mm:ss")],
                (err) => {
                    if (err) {
                        console.error("❌ Database error:", err);
                        return interaction.reply({ content: "❌ Failed to set reminder.", ephemeral: true });
                    }
                    interaction.reply({ content: `✅ Reminder set for **${RemindAt.format("YYYY-MM-DD HH:mm")} UTC**!`, ephemeral: false });
                }
            );
        }
    }
];
