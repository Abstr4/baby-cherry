const { SlashCommandBuilder, ChannelType, AttachmentBuilder } = require('discord.js');

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

        if (!thread || ![ChannelType.PublicThread, ChannelType.PrivateThread].includes(thread.type)) {
            return interaction.reply({ content: '❌ Invalid thread ID.', flags: 64 });
        }

        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: '❌ Invalid target channel ID.', flags: 64 });
        }

        await interaction.reply({ content: `🔁 Cloning thread **${thread.name}**...`, flags: 64 });

        // Create the new thread
        const newThread = await targetChannel.threads.create({
            name: `Cloned - ${thread.name}`,
            autoArchiveDuration: thread.autoArchiveDuration,
            reason: `Cloned from thread ID ${thread.id}`
        });

        // Fetch messages from the original thread
        let allMessages = [];
        let lastId;
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const fetched = await thread.messages.fetch(options);
            if (fetched.size === 0) break;

            allMessages = allMessages.concat(Array.from(fetched.values()));
            lastId = fetched.last().id;
        }

        allMessages.reverse(); // From oldest to newest

        for (const msg of allMessages) {
            // Skip system messages
            if (msg.system) continue;

            // Format message content with author and timestamp
            let content = `**${msg.author.tag}**:\n${msg.content || ''}`;

            if (content.length > 2000) {
                content = content.slice(0, 1997) + '...';
            }

            // Prepare attachments
            const files = [];
            for (const [, attachment] of msg.attachments) {
                // Reattach files (Discord auto-detects file types from URLs)
                try {
                    files.push(new AttachmentBuilder(attachment.url));
                } catch (err) {
                    console.warn(`⚠️ Failed to clone attachment: ${attachment.url}`);
                }
            }

            try {
                await newThread.send({
                    content: content.trim().length > 0 ? content : undefined,
                    files: files.length > 0 ? files : undefined,
                });
            } catch (err) {
                console.error(`Failed to send message from ${msg.author.tag}:`, err);
                await newThread.send(`⚠️ Could not clone a message from ${msg.author.tag}`);
            }
        }

        await interaction.followUp({ content: `✅ Thread cloned to <#${newThread.id}>`, flags: 64 });
    }
};
