require('dotenv').config();

// Modules load, don't touch this unless you're adding something new

const cron = require('node-cron');
const express = require("express");

const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');

const TOKEN = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const connection = require('./database.js');

const slashCommands = require('./commands/slash.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ],
});

require('./helpers/reminderScheduler.js')(client);

client.slashCommands = new Collection();

for (const command of slashCommands) {
    client.slashCommands.set(command.data.name, command);
}

// Your code below ---------------------------------------------------------

// Handles the slash commands, refresh every deploy / re-deploy

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Prepare commands for registration
    const commandsToRegister = slashCommands.map(command => command.data.toJSON());

    // Register Slash Commands
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try 
    {
        console.log('Started refreshing application (/) commands.');
        
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), // Register for specific guild
            { body: commandsToRegister }
        );
        console.log('Successfully reloaded application (/) commands.');
    } 
    catch (error) {
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

const handleExclamationCommand = require('./commands/handlers/exclamationCommands.js');

client.on('messageCreate', async (message) => {
    await handleExclamationCommand(message, connection);

});

const handleSlashCommand = require('./commands/handlers/slashCommands.js');

client.on('interactionCreate', async (interaction) => {
    await handleSlashCommand(interaction, client);
});


// Add the web server code here
const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(3001, () => {
    console.log("Web server is live on port 3001!");
});

client.login(TOKEN)
  .then(() => console.log('Bot logged in successfully!'))
  .catch((error) => console.error('Failed to log in:', error));