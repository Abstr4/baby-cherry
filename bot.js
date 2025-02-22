require('dotenv').config();
// Modules load, don't touch this unless you're adding something new

const blockedUsers = ['1209912413776904203', '909474089406722110'];

const cron = require('node-cron');
const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const express = require("express");
const fs = require("fs");
const path = require('path');

const TOKEN = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Path to the static commands JSON file
const staticCommandsPath = path.join(__dirname, './commands/exclamation/static.json');

// Preload static commands
let staticCommands = {};
if (fs.existsSync(staticCommandsPath)) {
    staticCommands = JSON.parse(fs.readFileSync(staticCommandsPath, 'utf-8'));
}

const dynamicCommands = require('./commands/exclamation/dynamic.js');
const slashCommands = require('./commands/slash.js');
const questionCommands = require('./commands/question.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

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
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), // Register for specific guild
            { body: commandsToRegister }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }

    // Schedule Boss Reminder at 11:50 UTC and 23:50 UTC
    const channelId = '1221395301433081916'; // Replace with your channel ID
    const roleId = '1307759931016871987'; // Replace with @pha's role ID

    cron.schedule('59 11,23 * * *', async () => {
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

// Handles the ! and ? commands
client.on('messageCreate', async (message) => {
    if (message.author.bot || blockedUsers.includes(message.author.id)) return;
    
    // Handle "!" commands
    if (message.content.startsWith('!')) {
        if(message.content === '!') return;
        const commandName = message.content.slice(1).split(' ')[0]; 

        // Handle static commands
        if (staticCommands[commandName]) {
            const command = staticCommands[commandName];
            message.channel
                .send(command.command_response)
                .then(() => console.log(command.console_log))
                .catch(console.error);
            return;
        }

        // Handle dynamic commands
        else if (dynamicCommands[commandName]) {
            await dynamicCommands[commandName].execute(message);
            return;
        }
        else { 
            // Command not found
            return;
        }
    }

    // Handle "?" commands
    if (message.content.startsWith('?')) {
        if(message.content === '?') return;
        const commandName = message.content.slice(1).split(' ')[0]; 
        const command = questionCommands[commandName];

        if (command) {
            message.channel
            .send(command.command_response)
            .then(() => console.log(command.console_log))
            .catch(console.error);
        } 
        else {
            message.channel.send(`Unknown command: ${commandName}`);
        }
    }
});


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || blockedUsers.includes(message.author.id)) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;
    try {
            console.log(`/${interaction.commandName} called`);
            await command.execute(interaction);
            staticCommands = JSON.parse(fs.readFileSync(staticCommandsPath, 'utf-8'));
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
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