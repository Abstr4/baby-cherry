const { REST, Routes } = require('discord.js');

async function registerCommands(client, slashCommands) {
    const TOKEN = process.env.BOT_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;
    
    const commandsToRegister = slashCommands.map(command => command.data.toJSON());
    console.log('Commands to register:', commandsToRegister);
    
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        // Directly update commands without clearing them first
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsToRegister });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

module.exports = registerCommands;
