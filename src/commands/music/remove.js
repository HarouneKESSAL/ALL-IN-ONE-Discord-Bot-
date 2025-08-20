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

    let number = interaction.options.getNumber('number');

    if (number >= queue.songs.length) return client.errNormal({
        error: `The queue doesn't have that much songs`,
        type: 'editreply'
    }, interaction);

    const targetSong = queue.songs[number];
    queue.remove(number);

    client.succNormal({
        text: `Removed **${targetSong.name}** from the queue`,
        type: 'editreply'
    }, interaction);
}

 
