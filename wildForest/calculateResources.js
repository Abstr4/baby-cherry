// Load the JSON data
const { CommandInteractionOptionResolver } = require('discord.js');
const levels = require('./levels.json');

// Function to calculate resources using subtraction
function calculateResources(startLevel, endLevel) {
    if (startLevel >= endLevel) {
        console.log('Invalid levels: starting level must be less than the ending level.');
        return;
    }

    // Access the levels directly
    const start = levels[startLevel - 1]; // Adjust for 0-based index
    const end = levels[endLevel - 1]; // Adjust for 0-based index

    // Calculate the required resources

    const shardsNeeded = parseInt(end.totalShards.replace(/,/g, '')) - parseInt(start.totalShards.replace(/,/g, ''));
    const goldNeeded = parseInt(end.totalGold.replace(/,/g, '')) - parseInt(start.totalGold.replace(/,/g, ''));

    // Return the results as an object
    return { shardsNeeded, goldNeeded };
}

module.exports = { calculateResources };

