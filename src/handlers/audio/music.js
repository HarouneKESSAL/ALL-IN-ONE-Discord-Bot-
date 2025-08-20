const Discord = require('discord.js');

module.exports = (client) => {
    client.on(Discord.Events.InteractionCreate, async (interaction) => {
        if (!interaction.isButton()) return;
        const queue = client.distube.getQueue(interaction.guild.id);
        if (!queue) return;

        if (interaction.customId == "Bot-musicpause") {
            interaction.deferUpdate();
            queue.pause();
            const embedData = interaction.message.embeds[0];
            let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.previous)
                        .setCustomId("Bot-musicprev")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.play)
                        .setCustomId("Bot-musicstart")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.stop)
                        .setCustomId("Bot-musicstop")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.next)
                        .setCustomId("Bot-musicnext")
                        .setStyle(Discord.ButtonStyle.Secondary),
                );
            client.embed({
                title: embedData.title,
                url: embedData.url,
                desc: `Music is currently paused`,
                thumbnail: embedData.thumbnail.url,
                fields: embedData.fields,
                components: [row],
                color: client.config.colors.error,
                type: 'edit'
            }, interaction.message);
        }

        if (interaction.customId == "Bot-musicstart") {
            interaction.deferUpdate();
            queue.resume();
            const embedData = interaction.message.embeds[0];
            let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.previous)
                        .setCustomId("Bot-musicprev")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.pause)
                        .setCustomId("Bot-musicpause")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.stop)
                        .setCustomId("Bot-musicstop")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.next)
                        .setCustomId("Bot-musicnext")
                        .setStyle(Discord.ButtonStyle.Secondary),
                );
            client.embed({
                title: embedData.title,
                url: embedData.url,
                desc: `Music is currently resumed`,
                thumbnail: embedData.thumbnail.url,
                fields: embedData.fields,
                components: [row],
                type: 'edit'
            }, interaction.message);
        }

        if (interaction.customId == "Bot-musicstop") {
            interaction.deferUpdate();
            queue.stop();
            client.embed({
                desc: `Music is currently stopped`,
                color: client.config.colors.error,
                components: [],
                type: 'edit'
            }, interaction.message);
        }

        if (interaction.customId == "Bot-musicnext") {
            interaction.deferUpdate();
            await queue.skip();
            const song = queue.songs[0];
            let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.previous)
                        .setCustomId("Bot-musicprev")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.pause)
                        .setCustomId("Bot-musicpause")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.stop)
                        .setCustomId("Bot-musicstop")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.next)
                        .setCustomId("Bot-musicnext")
                        .setStyle(Discord.ButtonStyle.Secondary),
                );
            client.embed({
                title: `${client.emotes.normal.music}・${song.name}`,
                url: song.url,
                desc: `Music started in <#${queue.voiceChannel.id}>!`,
                thumbnail: song.thumbnail,
                fields: [
                    {
                        name: `👤┆Requested By`,
                        value: `${song.user}`,
                        inline: true
                    },
                    {
                        name: `${client.emotes.normal.clock}┆Ends at`,
                        value: `<t:${((Date.now() / 1000) + song.duration).toFixed(0)}:f>`,
                        inline: true
                    },
                    {
                        name: `🎬┆Author`,
                        value: `${song.uploader?.name || 'Unknown'}`,
                        inline: true
                    }
                ],
                components: [row],
                type: 'edit'
            }, interaction.message);
        }

        if (interaction.customId == "Bot-musicprev") {
            interaction.deferUpdate();
            await queue.previous();
            const song = queue.songs[0];
            let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.previous)
                        .setCustomId("Bot-musicprev")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.pause)
                        .setCustomId("Bot-musicpause")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.stop)
                        .setCustomId("Bot-musicstop")
                        .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                        .setEmoji(client.emotes.music.next)
                        .setCustomId("Bot-musicnext")
                        .setStyle(Discord.ButtonStyle.Secondary),
                );
            client.embed({
                title: `${client.emotes.normal.music}・${song.name}`,
                url: song.url,
                desc: `Music started in <#${queue.voiceChannel.id}>!`,
                thumbnail: song.thumbnail,
                fields: [
                    {
                        name: `👤┆Requested By`,
                        value: `${song.user}`,
                        inline: true
                    },
                    {
                        name: `${client.emotes.normal.clock}┆Ends at`,
                        value: `<t:${((Date.now() / 1000) + song.duration).toFixed(0)}:f>`,
                        inline: true
                    },
                    {
                        name: `🎬┆Author`,
                        value: `${song.uploader?.name || 'Unknown'}`,
                        inline: true
                    }
                ],
                components: [row],
                type: 'edit'
            }, interaction.message);
        }
    }).setMaxListeners(0);
};
