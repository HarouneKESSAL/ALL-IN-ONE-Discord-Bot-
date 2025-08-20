const Discord = require('discord.js');
const lyricsFinder = require("lyrics-finder");

module.exports = async (client, interaction, args) => {
    let search = "";

        const queue = client.distube.getQueue(interaction.guild.id);

        const channel = interaction.member.voice.channel;
        if (!channel) return client.errNormal({
            error: `You're not in a voice channel!`,
            type: 'editreply'
        }, interaction);

        if (queue && (channel.id !== queue.voiceChannel.id)) return client.errNormal({
            error: `You're not in the same voice channel!`,
            type: 'editreply'
        }, interaction);

        if (!queue || !queue.songs.length) return client.errNormal({
            error: "There are no songs playing in this server",
            type: 'editreply'
        }, interaction);

        if (!interaction.options.getString('song')) {
            search = queue.songs[0].name;
        }
        else {
            search = interaction.options.getString('song');
        }

        let lyrics = "";

        try {
            lyrics = await lyricsFinder(search, "");
            if (!lyrics) lyrics = `No lyrics found for ${search} :x:`;
        } catch (error) {
            lyrics = `No lyrics found for ${search} :x:`;
        }

        client.embed({
            title: `${client.emotes.normal.music}・Lyrics For ${search}`,
            desc: lyrics,
            type: 'editreply'
        }, interaction)
}

 