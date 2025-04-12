const { PermissionFlagsBits } = require('discord.js');
const database = require('@database');

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
            case 'land_id':
                land_id = value;
                break;
            case 'Type':
                type = value;
                break;
            case 'Zone':
                zone = value;
                break;
            case 'Blocked':
                blocked = value;
                break;
            case 'City':
                city = value || null;
                break;
            case 'District':
                district = value || null;
                break;
            case 'Resources':
                resources = value ? value.split(',').map(item => item.trim()) : [];
                break;
            case 'Structures':
                structures = value ? value.split(',').map(item => item.trim()) : [];
                break;
            default:
                break;
        }
    });

    // Get the user ID
    user_id = message.author.id;

    let isBlocked = blocked == 'yes' || blocked == 'si' || blocked == 'sí';

    const landData = [
        land_id,
        user_id,
        type,
        zone,
        isBlocked,
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

        if (existingLand && existingLand.user_id === user_id) {
            // If the land exists and belongs to the user, update the existing record
            await database.query(
                `UPDATE Lands 
                SET type = ?, zone = ?, blocked = ?, city = ?, district = ?, resources = ?, structures = ?
                WHERE land_id = ?`,
                [
                    type, zone, blocked, city, district,
                    resources.join(', '),  // Save as comma-separated string
                    structures.join(', '),  // Save as comma-separated string
                    land_id
                ]
            );

            message.reply('✅ La land fue actualizada correctamente!');
        } else if (!existingLand) {
            // If the land doesn't exist, insert a new record
            await database.query(
                `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    land_id,
                    user_id,
                    type,
                    zone,
                    isBlocked,
                    city,
                    district,
                    resources.join(', '),
                    structures.join(', ')
                ]
            );

            message.reply('✅ La land fue registrada correctamente!');
        } else {
            // If the land exists but doesn't belong to the user, send an error
            message.reply('❌ No tienes permisos para modificar esta land.');
        }
    } catch (error) {
        console.error('Error adding or updating land:', error);
        message.reply('❌ Hubo un error al registrar o actualizar la land. Intenta de nuevo más tarde.');
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