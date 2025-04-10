require('dotenv').config();
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const connection = require('./database.js');

const handleExclamationCommand = require('./commands/handlers/exclamationCommands.js');
const scheduleBossReminder = require('./helpers/scheduleBossReminder.js');

const registerCommands = require('./helpers/registerCommands.js');
const slashCommands = require('./commands/slash/slash.js');
const loadSlashCommands = require('./helpers/loadSlashCommands.js');
const { handleSlashCommand, loadAllowList } = require('./commands/handlers/slashCommands');


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
    // Load allowlist for slash commands
    await loadAllowList(); 
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
app.listen(3002, () => {
    console.log("Web server is live on port 3002!");
});

// Log in the bot
client.login(TOKEN)
    .then(() => console.log('Bot logged in successfully!'))
    .catch((error) => console.error('Failed to log in:', error));