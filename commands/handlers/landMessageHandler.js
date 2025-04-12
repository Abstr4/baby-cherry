require('module-alias/register');
const database = require('@database');
const { PermissionFlagsBits } = require('discord.js');
const { cleanList, validateResourcesOrStructures } = require('../../helpers/helpers.js');

// Replace with the actual role ID required to register lands
const REQUIRED_ROLE_ID = 'YOUR_ROLE_ID_HERE';

async function handleLandMessage(message) {
    const member = await message.guild.members.fetch(message.author.id);

    // Check if the user is an admin or has the required role
    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return sendWarningAndDelete(message, `❌ No tienes permisos para registrar una land.`);
    }

    const landMessage = message.content.trim();

    // Define the regular expressions for each field
    const landRegex = {
        land_id: /^land_id:\s*(\d+)$/m,
        type: /^Type:\s*(\w+)$/m,
        zone: /^Zone:\s*(.+)$/m,
        blocked: /^Blocked:\s*(Sí|Si|Yes|No)$/im,
        city: /^City:\s*(.*)$/m,
        district: /^District:\s*(.*)$/m,
        resources: /^Resources:\s*([a-zA-Z\s,]+)$/m,
        structures: /^Structures:\s*([a-zA-Z\s,]+)$/m
    };

    // Extract and validate all fields
    const matches = {};
    for (const [key, regex] of Object.entries(landRegex)) {
        const match = landMessage.match(regex);
        if (match) {
            matches[key] = match[1].trim();
        } else {
            return sendWarningAndDelete(message, `❌ El campo **${key}** está en un formato incorrecto. Por favor, sigue el formato correcto.`);
        }
    }

    const resources = cleanList(matches.resources);
    const structures = cleanList(matches.structures);

    if (!validateResourcesOrStructures(resources)) {
        return sendWarningAndDelete(message, '❌ Los recursos deben contener solo letras, comas y espacios.');
    }

    if (!validateResourcesOrStructures(structures)) {
        return sendWarningAndDelete(message, '❌ Las estructuras deben contener solo letras, comas y espacios.');
    }

    try {
        const { land_id, type, zone, blocked, city, district } = matches;

        const blockedInput = blocked.trim().toLowerCase();
        const isBlocked = ['yes', 'si', 'sí'].includes(blockedInput);

        await database.query(
            `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                land_id,
                message.author.id,
                type,
                zone,
                isBlocked,
                city,
                district,
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

// Sends a warning and deletes the original + warning message after 2 minutes
async function sendWarningAndDelete(message, warningText) {
    const warningMessage = await message.reply(warningText);

    setTimeout(() => {
        warningMessage.delete().catch(() => {});
        message.delete().catch(() => {});
    }, 120000); // 2 minutes
}

module.exports = { handleLandMessage };
