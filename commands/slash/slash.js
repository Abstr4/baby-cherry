// Misc
const levelUp = require('./Misc/levelup.js');

// Command
const addCommand = require('./Command/addcommand.js');
const deleteCommand = require('./Command/delcommand.js');
const commands = require('./Command/commands.js');

// Event
const setEvent = require('./Event/setevent.js');
const events = require('./Event/events.js');
const delEvent = require('./Event/delevent.js');

// Reminder
const setReminder = require('./Reminder/setreminder.js');
const reminders = require('./Reminder/reminders.js');
const delReminder = require('./Reminder/delreminder.js');

// Slash
const allow = require('./Allow/allow.js');
const disallow = require('./Allow/disallow.js');
const allowList = require('./Allow/allowlist.js');

const lands = require('./Land/lands.js');
const addLand = require('./Land/addland.js');
const deleteLand = require('./Land/deleteland.js');
const landsInfo = require('./Land/landsinfo.js');

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
    allowList,

    // Lands
    addLand,
    deleteLand,
    lands,
    landsInfo
];
