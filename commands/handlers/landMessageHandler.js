const { PermissionFlagsBits } = require('discord.js');
const database = require('@database');
const { cleanList, validateResourcesOrStructures } = require('../../helpers/helpers.js');

async function handleLandMessage(message) {
    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return sendWarningAndDelete(message, `❌ No tienes permisos para registar una land.`);
    }

    const landMessage = message.content.trim();

    // Define the regular expressions for the land message format
    const landRegex = {
        land_id: /^land_id:\s*(\d+)$/m,
        type: /^Type:\s*(\w+)$/m,
        zone: /^Zone:\s*(.+)$/m,
        blocked: /^Blocked:\s*(Si|Sí|Yes|No)$/m,
        city: /^City:\s*(.*)$/m,
        district: /^District:\s*(.*)$/m,
        resources: /^Resources:\s*([a-zA-Z\s,]+)$/m,
        structures: /^Structures:\s*([a-zA-Z\s,]+)$/m
    };
    

    // Validate the land message format
    const matches = {};
    for (const [key, regex] of Object.entries(landRegex)) {
        const match = landMessage.match(regex);
        if (match) {
            matches[key] = match[1] ? match[1].trim() : '';  // Default to empty string if no match
        } else {
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

    try 
    {
        const { land_id, type, zone, blocked, city, district } = matches;

        // Check if the land_id already exists in the database
        const existingLand = await database.query(
            'SELECT * FROM Lands WHERE land_id = ?',
            [land_id]
        );

                // Normalize blocked value to lowercase and check if it represents "yes"
        const normalizedBlocked = blocked.toLowerCase();

        // Convert to boolean based on possible values
        const isBlocked = normalizedBlocked === 'yes' || normalizedBlocked === 'si' || normalizedBlocked === 'sí';

        if (existingLand.length > 0) {
            // If land_id exists, update the existing record
            await database.query(
                `UPDATE Lands 
                 SET user_id = ?, type = ?, zone = ?, blocked = ?, city = ?, district = ?, resources = ?, structures = ?
                 WHERE land_id = ?`,
                [
                    message.author.id,
                    type,
                    zone,
                    isBlocked,
                    city,
                    district,
                    resources,
                    structures,
                    land_id
                ]
            );

            message.reply('✅ La land fue actualizada correctamente!');
        } else {
            // If land_id does not exist, insert the new land
            await database.query(
                `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    land_id,
                    message.author.id, // Store user_id of the message author
                    type,
                    zone,
                    blocked === 'Yes',  // Convert blocked to boolean
                    city,
                    district,
                    resources,
                    structures
                ]
            );

            message.reply('✅ La land fue registrada correctamente!');
        }
    } catch (error) {
        console.error('Error adding/updating land:', error);
        message.reply('❌ Hubo un error al registrar o actualizar la land. Intenta de nuevo más tarde.');
    }
}

module.exports = { handleLandMessage };