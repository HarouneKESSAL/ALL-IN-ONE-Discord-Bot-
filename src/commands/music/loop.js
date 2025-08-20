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

    if (!queue || !queue.songs.length) return client.errNormal({
        error: "There are no songs playing in this server",
        type: 'editreply'
    }, interaction);

    const mode = queue.repeatMode === 1 ? 0 : 1;
    queue.setRepeatMode(mode);
    const trackRepeat = mode === 1 ? "enabled" : "disabled";

    client.succNormal({
        text: `Loop is **${trackRepeat}** for the current song`,
        type: 'editreply'
    }, interaction);
}

 