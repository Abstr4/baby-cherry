const { ContextMenuCommandBuilder } = require("discord.js");

const getPhilippinesTime = () => {
    try {
        const philippineTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Manila',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        }).format(new Date());
        return `The current time in the Philippines is: ${philippineTime}`;
    } catch (error) {
        console.error('Error calculating Philippine time:', error);
        return 'There was an error retrieving the Philippine time.';
    }
};

const allowedChannelId = '1313964854708797451';

module.exports = {
    filitime: {
        description: 'Tells the time in the Philippines',
        execute: async (message) => {
            const response = getPhilippinesTime();
            message.channel
                .send(response)
                .then(() => console.log('!filitime command called'))
                .catch(console.error);
        },
    },
};
