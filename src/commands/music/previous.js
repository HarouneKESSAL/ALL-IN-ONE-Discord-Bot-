const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
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
    if (!queue || queue.previousSongs.length === 0) return client.errNormal({
        error: "There are no songs was played previously",
        type: 'editreply'
    }, interaction);

    await queue.previous();

    client.succNormal({
        text: `Playing previous song!`,
        type: 'editreply'
    }, interaction);
}

 