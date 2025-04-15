const { PermissionFlagsBits } = require('discord.js');

/**
 * Converts any valid date input to MySQL DATETIME format
 * @param {string | Date} input
 * @returns {string} Formatted date
 */
function formatToMySQLDate(input) {
    return moment.utc(input).format("YYYY-MM-DD HH:mm:ss");
}


// Function to clean lists (resources, structures)
function cleanList(input) {
    return input
        .split(",")
        .map(item => item.trim().toLowerCase())
        .join(", ");
}

// Function to validate resources or structures (letters, commas, and spaces)
function validateResourcesOrStructures(input) {
    const regex = /^[a-zA-Z\s,]+$/;
    return regex.test(input);
}

function isNumeric(str) {
    return /^[0-9]+$/.test(str);
}

function isLand(str) {
    const validLandTypes = ["homestead", "settlement", "city", "village"];
    return validLandTypes.includes(str.toLowerCase());
}
function isValidYesNo(str) {
    if (typeof str !== 'string') return false;

    const validValues = ["yes", "sí", "si", "y", "no", "n"];
    return validValues.includes(str.toLowerCase());
}

function isYes(str) {
    if (typeof str !== 'string') return false;

    const yesValues = ["yes", "sí", "si", "y"];
    return yesValues.includes(str.toLowerCase());
}

function isAdmin(interaction) {
    return interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
}
function sendNoPermissionMessage(interaction) {
    return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        flags: 64,
    });
}


module.exports = { cleanList, validateResourcesOrStructures, isNumeric, isLand, isValidYesNo, isYes, isAdmin, formatToMySQLDate, sendNoPermissionMessage };