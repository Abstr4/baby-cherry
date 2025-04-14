const { PermissionFlagsBits } = require('discord.js');
const database = require('@database');
const helpers = require('@helpers');

async function handleLandMessage(message) {

    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return sendWarningAndDelete(message, `❌ No tienes permisos para registrar una land.`);
    }

    const landMessage = message.content.trim();

    const fields = landMessage.split('\n');

    let land_id, type, zone, blocked, city, district, resources, structures, user_id;

    fields.forEach(field => {
        const [key, value] = field.split(':').map(item => item.trim());
        switch (key) {
            case 'Land_id':
                if (!helpers.isNumeric(value)) {
                    return sendWarningAndDelete(message, `❌ El ID de la land debe ser numérico.`);
                }
                land_id = value;
                break;

            case 'Type':
                if (!helpers.isLand(value)) {
                    return sendWarningAndDelete(message, `❌ El Tipo de land debe ser Homestead, Settlement, City o Village.`);
                }
                type = value;
                break;

            case 'Zone':
                zone = value;
                break;

            case 'Blocked':
                if (!helpers.isValidYesNo(value)) {
                    return sendWarningAndDelete(message, `❌ El valor debe ser "si" o "no".`);
                }
                blocked = helpers.isYes(value.toLowerCase());
                break;

            case 'City':
                city = value || null;
                break;

            case 'District':
                district = value || null;
                break;

            case 'Resources':
                // Convert each resource to lowercase
                resources = value ? value.split(',').map(item => item.trim().toLowerCase()) : [];
                break;

            case 'Structures':
                // Convert each structure to lowercase
                structures = value ? value.split(',').map(item => item.trim().toLowerCase()) : [];
                break;

            default:
                break;
        }
    });

    user_id = message.author.id;
    const landData = [
        land_id,
        user_id,
        type,
        zone,
        blocked,
        city,
        district,
        resources,
        structures
    ];

    console.log(landData);

    try {
        // Check if the land already exists in the database
        const [existingLand] = await database.query(
            'SELECT * FROM Lands WHERE land_id = ?',
            [land_id]
        );

        console.log(existingLand);

        // If it exists, update it
        if (existingLand.length > 0 && existingLand[0].user_id === user_id) {
            await database.query(
                `UPDATE Lands 
                SET type = ?, zone = ?, blocked = ?, city = ?, district = ?, resources = ?, structures = ?
                WHERE land_id = ?`,
                [
                    type, zone, blocked, city, district,
                    resources.join(', '),
                    structures.join(', '),
                    land_id
                ]
            );

            message.reply('✅ La land fue actualizada correctamente!');
        }
        // If the land doesn't exist, insert a new record
        else if (existingLand.length === 0) {
            await database.query(
                `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    land_id,
                    user_id,
                    type,
                    zone,
                    blocked,
                    city,
                    district,
                    resources.join(', '),
                    structures.join(', ')
                ]
            );
            console.log(`User with ID: ${message.author.id} successfully registered a land.`)
            message.reply('✅ La land fue registrada correctamente!');
        }
        // If the land exists but doesn't belong to the user, send an error
        else {
            console.log(`User with ID: ${message.author.id} tried to modified anothers land.`)
            await sendWarningAndDelete(message, '❌ No tienes permisos para modificar esta land.')
        }
    } catch (error) {
        console.error('Error adding or updating land:', error);
        await sendWarningAndDelete(message, '❌ Hubo un error al registrar o actualizar la land. Intenta de nuevo más tarde.')
    }
}

async function sendWarningAndDelete(message, warningText) {

    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) return;

    const warningMessage = await message.reply(warningText);
    setTimeout(() => {
        warningMessage.delete();
        message.delete();
    }, 120000); // 2 minutes = 120000 ms
}

module.exports = { handleLandMessage };