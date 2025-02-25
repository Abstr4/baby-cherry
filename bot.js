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
for (const command of slashCommands) {
    client.slashCommands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Register Slash Commands
    const commandsToRegister = slashCommands.map(command => command.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), 
            { body: commandsToRegister }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }

    // Schedule Boss Reminder at 11:50 UTC and 23:50 UTC
    const channelId = '1221395301433081916'; // Replace with your channel ID
    const roleId = '1307759931016871987'; // Replace with @pha's role ID

    cron.schedule('50 11,23 * * *', async () => {
        try {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send(`<@&${roleId}> :clown: Pierrot boss starts in 10 mins`);
                console.log("Boss reminder sent!");
            }
        } catch (err) {
            console.error("Failed to send boss reminder:", err);
        }
    }, { timezone: "UTC" });

    console.log("Boss reminder scheduler started.");
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