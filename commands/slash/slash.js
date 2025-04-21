// Misc
const levelUp = require('./Misc/levelUp.js');
const clonethread = require('./Misc/clonethread.js')
const scout = require('./Misc/scout.js');
const scout = require('./Misc/bosses.js');

// Command
const addCommand = require('./Command/addCommand.js');
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
const allowList = require('./Allow/allowlist.js');

// Lands
const lands = require('./Land/lands.js');
const addLand = require('./Land/addland.js');
const deleteLand = require('./Land/deleteland.js');
const landsInfo = require('./Land/landsinfo.js');

// Permission
const permissions_add = require('./Permission/permissions-add.js');
const permissions_remove = require('./Permission/permissions-remove.js');
const permissions_list = require('./Permission/permissions-list.js');

module.exports = [

    // Misc
    levelUp,
    clonethread,
    scout,
    bosses,

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
    landsInfo,

    // Permissions
    permissions_add,
    permissions_list,
    permissions_remove
];
