function sendEphemeralMessage(target, message) {
    if (typeof target.reply === "function") {
        return target.reply({
            content: message,
            flags: 64, // Ephemeral
        });
    } else if (target.channel && typeof target.channel.send === "function") {
        return target.channel.send(message);
    }
}

function sendMessage(target, message) {
    if (typeof target.reply === "function") {
        return target.reply({
            content: message,
        });
    } else if (target.channel && typeof target.channel.send === "function") {
        return target.channel.send(message);
    }
}

module.exports = {
    sendEphemeralMessage,
    sendMessage,
};
