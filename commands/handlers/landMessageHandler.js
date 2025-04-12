const { PermissionFlagsBits } = require('discord.js');

async function handleLandMessage(message) {

    const member = await message.guild.members.fetch(message.author.id);

    // Check if the user has the correct permissions
    if (!member.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has(REQUIRED_ROLE_ID)) {
        return sendWarningAndDelete(message, `❌ No tienes permisos para registrar una land.`);
    }

    // Extract the message content (assuming it's in the correct format)
    const landMessage = message.content.trim();

    // Manually split the message into fields based on the expected format
    const fields = landMessage.split('\n');

    // Initialize variables
    let land_id, type, zone, blocked, city, district, resources, structures, user_id;

    // Process each field to extract values
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
                city = value || null;  // Set to null if the value is empty
                break;
            case 'District':
                district = value || null;  // Set to null if the value is empty
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

    // Get the user ID from the message author
    user_id = message.author.id;

    // Prepare the data to be inserted or updated
    const landData = [
        land_id,       // land_id
        user_id,       // user_id
        type,          // Type
        zone,          // Zone
        blocked,       // Blocked
        city,          // City (null if empty)
        district,      // District (null if empty)
        resources,     // Resources (array)
        structures     // Structures (array)
    ];

    try {
        // Check if the land already exists in the database
        const [existingLand] = await database.query(
            'SELECT * FROM Lands WHERE land_id = ?',
            [land_id]
        );

        if (existingLand) {
            // If the land exists, update the existing record
            if (existingLand.user_id !== user_id) {
                return sendWarningAndDelete(message, '❌ No tienes permisos para modificar esta land.');
            }

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
        } else {
            // If the land doesn't exist, insert a new record
            await database.query(
                `INSERT INTO Lands (land_id, user_id, type, zone, blocked, city, district, resources, structures)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    land_id,
                    user_id, // Store user_id of the message author
                    type,
                    zone,
                    blocked === 'Yes',  // Convert blocked to boolean
                    city,
                    district,
                    resources.join(', '),  // Save as comma-separated string
                    structures.join(', ')  // Save as comma-separated string
                ]
            );

            message.reply('✅ La land fue registrada correctamente!');
        }
    } catch (error) {
        console.error('Error adding or updating land:', error);
        message.reply('❌ Hubo un error al registrar o actualizar la land. Intenta de nuevo más tarde.');
    }
}

module.exports = { handleLandMessage };