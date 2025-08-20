const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const queue = client.distube.getQueue(interaction.guild.id);

    const levels = {
        0: null,
        1: 'bassboost_low',
        2: 'bassboost',
        3: 'bassboost_high',
    };

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

    let level = interaction.options.getString('level');

    queue.filters.clear();
    if (levels[level]) queue.filters.add(levels[level]);

    client.succNormal({
        text: `Bass boost level adjusted to **level ${level}**`,
        type: 'editreply'
    }, interaction);
}

 