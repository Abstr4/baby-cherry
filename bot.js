require('dotenv').config();
const express = require("express");
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const connection = require('./database.js');

const handleExclamationCommand = require('./commands/handlers/exclamationCommands.js');

const registerCommands = require('./helpers/registerCommands.js');
const slashCommands = require('./commands/slash/slash.js');
const loadSlashCommands = require('./helpers/loadSlashCommands.js');
const { handleSlashCommand, loadAllowList } = require('./commands/handlers/slashCommands');
const { handleLandMessage } = require('./commands/handlers/landMessageHandler.js');

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
});

// Message Command Handler
client.on('messageCreate', async (message) => {
    const LAND_CHANNEL_ID = '1360626314993860818';

    if (message.author.bot) return; 
    if (message.channel.id === LAND_CHANNEL_ID) {
        await handleLandMessage(message);
        return;
    }
    if (message.content.startsWith("!")) {
        await handleExclamationCommand(message, connection);
    }
});
// Slash Command Handler
client.on('interactionCreate', async (interaction) => {
    if(interaction.user.bot) return;
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