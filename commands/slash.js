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

// reminder
const setReminder = require('./slash/Reminder/setReminder.js');
const reminders = require('./slash/Reminder/reminders.js');
const delReminder = require('./slash/Reminder/delReminder.js');

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
    delEvent,

    // Reminder
    setReminder,
    reminders,
    delReminder
];
