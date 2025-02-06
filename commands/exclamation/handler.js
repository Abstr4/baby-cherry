const fs = require('fs');
const path = require('path');

// Load commands from JSON
const commandsFilePath = path.join(__dirname, 'commands.json');
let commands = JSON.parse(fs.readFileSync(commandsFilePath, 'utf-8'));

module.exports = {
    getCommand(commandName) {
        return commands[commandName];
    },
    addCommand(commandName, commandDetails) {
        commands[commandName] = commandDetails;
        fs.writeFileSync(commandsFilePath, JSON.stringify(commands, null, 2), 'utf-8');
    }
};
