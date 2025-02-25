require('dotenv').config();
const cron = require('node-cron');
const express = require("express");
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const connection = require('./database.js');

const slashCommands = require('./commands/slash.js');
const handleExclamationCommand = require('./commands/handlers/exclamationCommands.js');
const handleSlashCommand = require('./commands/handlers/slashCommands.js');
const registerCommands = require('./helpers/registerCommands.js');
const scheduleBossReminder = require('./helpers/scheduleBossReminder.js');
const loadSlashCommands = require('./helpers/loadSlashCommands.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

require('./helpers/reminderScheduler.js')(client);

// Load slash commands
client.slashCommands = new Collection();
loadSlashCommands(client, slashCommands);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Register Slash Commands
    await registerCommands(client, slashCommands);
    // Schedule Boss Reminder at 11:50 UTC and 23:50 UTC
    scheduleBossReminder(client);
});

// Message Command Handler
client.on('messageCreate', async (message) => {
    await handleExclamationCommand(message, connection);
});

// Slash Command Handler
client.on('interactionCreate', async (interaction) => {
    await handleSlashCommand(interaction, client);
});

// Web Server
const app = express();
app.get("/", (req, res) => {
    res.send("Bot is running!");
});
app.listen(3001, () => {
    console.log("Web server is live on port 3001!");
});

// Log in the bot
client.login(TOKEN)
    .then(() => console.log('Bot logged in successfully!'))
    .catch((error) => console.error('Failed to log in:', error));