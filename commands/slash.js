// Misc
const levelUp = require('./slash/Misc/levelUp.js');

// Command
const addCommand = require('./slash/Command/addCommand');
const deleteCommand = require('./slash/Command/delCommand.js');
const commands = require('./slash/Command/commands.js');

// Event
const setEvent = require('./slash/Event/setEvent.js');
const events = require('./slash/Event/events.js');
const delEvent = require('./slash/Event/delEvent.js');

module.exports = [

    // Misc
    levelUp,

    // Command
    addCommand,
    deleteCommand,
    commands,

    // Event
    setEvent,
    events,
    delEvent
];
