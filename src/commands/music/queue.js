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

    let count = 0;
    let status;

    if (queue.songs.length <= 1) {
        status = "No more music in the queue";
    }
    else {
        status = queue.songs.slice(1).map((track) => {
            count += 1;
            return (`**[#${count}]**┆${track.name.length >= 45 ? `${track.name.slice(0, 45)}...` : track.name} (Requested by <@${track.user.id || track.user}>)`);
        }).join("\n");
    }

    const thumbnail = queue.songs[0].thumbnail || interaction.guild.iconURL({ size: 1024 });

    client.embed({
        title: `${client.emotes.normal.music}・Songs queue - ${interaction.guild.name}`,
        desc: status,
        thumbnail: thumbnail,
        fields: [
            {
                name: `${client.emotes.normal.music} Current song:`,
                value: `${queue.songs[0].name} (Requested by <@${queue.songs[0].user.id || queue.songs[0].user}>)`
            }
        ],
        type: 'editreply'
    }, interaction)
}

 