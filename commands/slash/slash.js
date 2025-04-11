// Misc
const levelUp = require('./Misc/levelUp.js');

// Command
const addCommand = require('./Command/addCommand');
const deleteCommand = require('./Command/delCommand.js');
const commands = require('./Command/commands.js');

// Event
const setEvent = require('./Event/setEvent.js');
const events = require('./Event/events.js');
const delEvent = require('./Event/delEvent.js');

// Reminder
const setReminder = require('./Reminder/setReminder.js');
const reminders = require('./Reminder/reminders.js');
const delReminder = require('./Reminder/delReminder.js');

// Slash
const allow = require('./Allow/allow.js');
const disallow = require('./Allow/disallow.js');
const allowlist = require('./Allow/allowlist.js')

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
    delReminder,

    // Slash
    allow,
    disallow,
    allowlist

];
