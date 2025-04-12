const { PermissionFlagsBits } = require('discord.js');
const database = require('@database');
const { cleanList, validateResourcesOrStructures } = require('../../helpers/helpers.js');

async function handleLandMessage(message) {

    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return sendWarningAndDelete(message, `❌ No tienes permisos para registrar una land.`)
    }

    const landMessage = message.content.trim();

    // Define the regular expressions for the land message format
    const landRegex = {
        land_id: /^land_id:\s*(\d+)$/m,
        type: /^Type:\s*(\w+)$/m,
        zone: /^Zone:\s*(.+)$/m,
        blocked: /^Blocked:\s*(Si|Sí|Yes|No)$/m,
        city: /^City:\s*(.*?)$/m,  // Non-greedy match to allow empty values
        district: /^District:\s*(.*?)$/m,  // Non-greedy match to allow empty values
        resources: /^Resources:\s*([a-zA-Z\s,]+)$/m,
        structures: /^Structures:\s*([a-zA-Z\s,]+)$/m
    };

    // Validate the land message format
    const matches = {};
    for (const [key, regex] of Object.entries(landRegex)) {
        const match = landMessage.match(regex);
        if (match) {
            matches[key] = match[1].trim();
        } else {
            // If the format is invalid, return false and send a warning
            return sendWarningAndDelete(message, `❌ El campo **${key}** está en un formato incorrecto. Por favor, sigue el formato correcto.`);
        }
    }

    // Clean lists and validate resources/structures
    const resources = cleanList(matches.resources);
    const structures = cleanList(matches.structures);

    if (!validateResourcesOrStructures(resources)) {
        return sendWarningAndDelete(message, '❌ Los recursos deben contener solo letras, comas y espacios.');
    }

    if (!validateResourcesOrStructures(structures)) {
        return sendWarningAndDelete(message, '❌ Las estructuras deben contener solo letras, comas y espacios.');
    }

    // If all validations pass, proceed to add the land
    try {
        const { land_id, type, zone, blocked, city, district } = matches;

        // Insert the land into the database (this assumes you have a valid `database` module)
        await database.query(
            `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                land_id,
                message.author.id, // Store user_id of the message author
                type,
                zone,
                blocked === 'Yes',  // Convert blocked to boolean
                city || null,  // Handle empty city as null
                district || null,  // Handle empty district as null
                resources,
                structures
            ]
        );

        message.reply('✅ La land fue registrada correctamente!');
    } catch (error) {
        console.error('Error adding land:', error);
        message.reply('❌ Hubo un error al registrar la land. Intenta de nuevo más tarde.');
    }
}

// Helper function to send a warning message and delete the invalid message after 2 minutes
async function sendWarningAndDelete(message, warningText) {

    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const warningMessage = await message.reply(warningText);
    setTimeout(() => {
        warningMessage.delete();
        message.delete();
    }, 120000); // 2 minutes = 120000 ms
}

module.exports = { handleLandMessage, sendWarningAndDelete };
