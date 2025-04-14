const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clonethread')
        .setDescription('Clone a thread into a new thread in another channel.')
        .addStringOption(option =>
            option.setName('thread_id')
                .setDescription('The ID of the thread to clone.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('target_channel_id')
                .setDescription('The ID of the channel where the new thread will be created.')
                .setRequired(true)),

    async execute(interaction) {
        const threadId = interaction.options.getString('thread_id');
        const targetChannelId = interaction.options.getString('target_channel_id');

        const thread = await interaction.client.channels.fetch(threadId).catch(() => null);
        const targetChannel = await interaction.client.channels.fetch(targetChannelId).catch(() => null);

        if (!thread || thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread) {
            return interaction.reply({ content: '❌ Invalid thread ID.', flags: 64 });
        }

        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: '❌ Invalid target channel ID.', flags: 64 });
        }

        await interaction.reply({ content: `🔁 Cloning thread **${thread.name}**...`, flags: 64 });

        const newThread = await targetChannel.threads.create({
            name: `Cloned - ${thread.name}`,
            autoArchiveDuration: thread.autoArchiveDuration,
            reason: `Cloned from thread ID ${thread.id}`
        });

        const messages = await thread.messages.fetch({ limit: 100 });
        const sortedMessages = Array.from(messages.values()).reverse(); // Oldest to newest

        for (const msg of sortedMessages) {
            const content = `**${msg.author.tag}** (${msg.createdAt.toISOString()}):\n${msg.content}`;
            if (content.length <= 2000) {
                await newThread.send(content);
            } else {
                await newThread.send(content.slice(0, 1997) + '...');
            }
        }

        await interaction.followUp({ content: `✅ Thread cloned to <#${newThread.id}>`, flags: 64 });
    }
};
