const { PermissionFlagsBits } = require('discord.js');
const database = require('@database');
const helpers = require('@helpers');

const REQUIRED_ROLE_ID = '1263974586530402466';

async function handleLandMessage(message) {
    const member = await message.guild.members.fetch(message.author.id);

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
        if (!member.roles.cache.has(REQUIRED_ROLE_ID)) {
            await sendWarningAndDelete(message, `❌ No tienes permisos para registrar una land.`);
            return;
        }
    }

    const landMessage = message.content.trim();
    const fields = landMessage.split('\n');

    let land_id, type, zone, blocked, city, district, resources, structures, user_id;

    for (const field of fields) {
        const [keyRaw, valueRaw] = field.split(':');
        if (!keyRaw || !valueRaw) continue;

        const key = keyRaw.trim();
        const value = valueRaw.trim();

        switch (key) {
            case 'Land_id':
                if (!helpers.isNumeric(value)) {
                    await sendWarningAndDelete(message, `❌ El ID de la land debe ser numérico.`);
                    return;
                }
                land_id = value;
                break;

            case 'Type':
                if (!helpers.isLand(value)) {
                    await sendWarningAndDelete(message, `❌ El Tipo de land debe ser Homestead, Settlement, City o Village.`);
                    return;
                }
                type = value;
                break;

            case 'Zone':
                zone = value;
                break;

            case 'Blocked':
                if (!helpers.isValidYesNo(value)) {
                    await sendWarningAndDelete(message, `❌ El valor debe ser "si" o "no".`);
                    return;
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
                resources = value
                    ? value.split(',').map(item => item.trim().toLowerCase())
                    : [];
                break;

            case 'Structures':
                structures = value
                    ? value.split(',').map(item => item.trim().toLowerCase())
                    : [];
                break;

            default:
                break;
        }
    }

    user_id = message.author.id;

    // Sanity check before hitting the DB
    if (!land_id || !user_id || !type || !zone || typeof blocked !== 'boolean') {
        await sendWarningAndDelete(message, '❌ Faltan campos obligatorios o están mal formateados.');
        return;
    }

    const landData = [
        land_id,
        user_id,
        type,
        zone,
        blocked,
        city,
        district,
        resources.join(', '),
        structures.join(', ')
    ];

    try {
        const [existingLand] = await database.query(
            'SELECT * FROM Lands WHERE land_id = ?',
            [land_id]
        );

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
        } else if (existingLand.length === 0) {
            await database.query(
                `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                landData
            );

            console.log(`User with ID: ${message.author.id} successfully registered a land.`);
            message.reply('✅ La land fue registrada correctamente!');
        } else {
            console.log(`User with ID: ${message.author.id} tried to modify another user's land.`);
            await sendWarningAndDelete(message, '❌ No tienes permisos para modificar esta land.');
        }

    } catch (error) {
        console.error('Error adding or updating land:', error);
        await sendWarningAndDelete(message, '❌ Hubo un error al registrar o actualizar la land. Intenta de nuevo más tarde.');
    }
}

async function sendWarningAndDelete(message, warningText) {
    const warningMessage = await message.reply(warningText);
    setTimeout(() => {
        warningMessage.delete();
        message.delete();
    }, 30000); // 30 seconds
}

module.exports = { handleLandMessage };
