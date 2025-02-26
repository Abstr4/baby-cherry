const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const moment = require('moment');
const database = require("../database.js"); // ✅ Import it directly
const levelUpCommand = require('./slash/levelup.js');

// Allowed User IDs
let allowedUsers = ['396392854798336002', '357087654552010753', '167821784333287424', '253329702662569987'];

module.exports = [

    // addcommand 
    {
        levelUpCommand,
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
            const commandName = interaction.options.getString("command");
            const response = interaction.options.getString("response");
    
                // Ensure command starts with "!"
            if (!commandName.startsWith("!")) {
                return interaction.reply({ content: "❌ Commands must start with `!`. Example: `!hello`", ephemeral: true });
            }
            try {
                // Check if the command already exists
                const [existing] = await database.query(
                    "SELECT * FROM ExclamationCommands WHERE Command = ?",
                    [commandName]
                );
    
                if (existing.length > 0) {
                    return interaction.reply({
                        content: `❌ The command \`${commandName}\` already exists.`,
                        flags: 64
                    });
                }
                
                // Insert the new command
                await database.query(
                    "INSERT INTO ExclamationCommands (Command, Response) VALUES (?, ?)",
                    [commandName, response]
                );
    
                return interaction.reply({
                    content: `✅ Command \`${commandName}\` has been added successfully!`,
                    flags: 64
                });
    
            } catch (err) {
                console.error("❌ Database error:", err);
                return interaction.reply({
                    content: "❌ Failed to add the command due to a database error.",
                    flags: 64
                });
            }
        }
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
                database.query(
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
    // setreminder
    {
        data: new SlashCommandBuilder()
        .setName("setreminder")
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
                    ephemeral: true // ✅ Use `ephemeral: true` instead of `flags: 64`
                });
            }
        
            try {
                // ✅ Use `await db.execute()` since `pool` supports promises
                await database.execute(
                    "INSERT INTO Reminders (Message, RemindAt, ChannelId) VALUES (?, ?, ?)",
                    [message, remindAt.format("YYYY-MM-DD HH:mm:ss"), channelId]
                );
        
                await interaction.reply({
                    content: `✅ Reminder set for <t:${Math.floor(remindAt.unix())}:F> in <#${channelId}>.`,
                    ephemeral: true
                });
            } catch (err) {
                console.error("❌ Database error:", err);
                return interaction.reply({ content: "❌ Failed to save reminder.", ephemeral: true });
            }
        }
    }
];
