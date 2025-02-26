const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const moment = require('moment');
const database = require("../database.js"); // ✅ Import it directly
const levelUpCommand = require('./slash/levelUpCommand.js');
const addCommand = require('./slash/addCommand.js');
const deleteCommand = require('./slash/deleteCommand.js');
const setReminderCommand = require('./slash/setReminderCommand.js');


// Allowed User IDs
let allowedUsers = ['396392854798336002', '357087654552010753', '167821784333287424', '253329702662569987'];

module.exports = [

    levelUpCommand,
    addCommand,
    deleteCommand,
    setReminderCommand
];
