const handleExclamationCommand = async (message, connection) => {

    const commandName = message.content.trim().split(/\s+/)[0].toLowerCase();
    console.log(`🔍 Extracted commandName: "${commandName}"`);
    try {
        // Query the database for the command
        const [results] = await connection.execute(
            'SELECT Response FROM ExclamationCommand WHERE Command = ?',
            [commandName]
        );
        console.log(`📝 Query result:`, results);
        if (results.length > 0) {
            // Send the command's response from the database
            await message.channel.send(results[0].Response);
        } else {
            console.log(`⚠️ No response found for command: ${commandName}`);
        }
    } catch (err) {
        console.error('❌ Database query error:', err);
    }
};

module.exports = handleExclamationCommand;
