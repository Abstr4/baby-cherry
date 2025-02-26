const levelUp = require('./slash/levelUp.js');
const addCommand = require('./slash/addCommand.js');
const deleteCommand = require('./slash/deleteCommand.js');
const setEvent = require('./slash/setEvent.js');
const commands = require('./slash/commands.js');
const events = require('./slash/events.js');
const deleteEventById = require('./slash/deleteEventById.js');

module.exports = [
    levelUp,
    addCommand,
    deleteCommand,
    setEvent,
    commands,
    events,
    deleteEventById
];
