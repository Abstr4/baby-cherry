const { Collection } = require('discord.js');

/**
 * Loads all slash commands into the bot client.
 * @param {Client} client - The Discord bot client.
 * @param {Array} slashCommands - The list of slash commands.
 */
function loadSlashCommands(client, slashCommands) {
    client.slashCommands = new Collection();
    for (const command of slashCommands) {
        client.slashCommands.set(command.data.name, command);
    }
    console.log('Slash commands loaded successfully!');
}

module.exports = loadSlashCommands;
