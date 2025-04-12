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
    let land_id, type, zone, blocked, city, district, resources, structures;

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

    // Prepare the output in the desired format
    const landData = [
        land_id,       // land_id
        type,          // Type
        zone,          // Zone
        blocked,       // Blocked
        city,          // City (null if empty)
        district,      // District (null if empty)
        resources,     // Resources (array)
        structures     // Structures (array)
    ];

    // Log the result
    console.log(landData);

    // Send a reply indicating the success
    message.reply('✅ La land fue registrada correctamente!');
}

module.exports = { handleLandMessage };