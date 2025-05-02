const buttonInteractionHandler = async (interaction) => {
    const member = interaction.member;
    const [action, roleId] = interaction.customId.split("_");

    if (!roleId || !member || !member.guild) return;

    try {
        const role = await member.guild.roles.fetch(roleId);
        if (!role) {
            return await interaction.reply({ content: "⚠️ Role not found.", flags: 64 });
        }

        if (action === "subscribe") {
            if (member.roles.cache.has(roleId)) {
                return await interaction.reply({ content: "✅ You're already subscribed.", flags: 64 });
            }
            await member.roles.add(roleId);
            return await interaction.reply({ content: `🎉 Subscribed to **${role.name}** notifications!`, flags: 64 });
        }

        if (action === "unsubscribe") {
            if (!member.roles.cache.has(roleId)) {
                return await interaction.reply({ content: "⚠️ You're not subscribed.", flags: 64 });
            }
            await member.roles.remove(roleId);
            return await interaction.reply({ content: `❌ Unsubscribed from **${role.name}** notifications.`, flags: 64 });
        }
    } catch (error) {
        console.error("❌ Error processing button interaction:", error);
        await interaction.reply({ content: "❌ An error occurred while processing your request.", flags: 64 });
    }
};

module.exports = buttonInteractionHandler;
