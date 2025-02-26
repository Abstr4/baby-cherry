const levelUpCommand = require('./slash/levelUpCommand.js');
const addCommand = require('./slash/addCommand.js');
const deleteCommand = require('./slash/deleteCommand.js');
const setReminderCommand = require('./slash/setReminderCommand.js');

module.exports = [
    levelUpCommand,
    addCommand,
    deleteCommand,
    setReminderCommand
];
