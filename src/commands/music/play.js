const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const channel = interaction.member.voice.channel;
    if (!channel) return client.errNormal({
        error: `You're not in a voice channel!`,
        type: 'editreply'
    }, interaction);

    const queue = client.distube.getQueue(interaction.guild.id);
    if (queue && channel.id !== queue.voiceChannel.id) return client.errNormal({
        error: `You are not in the same voice channel!`,
        type: 'editreply'
    }, interaction);

    const query = interaction.options.getString('song');

    client.simpleEmbed({
        desc: `🔎┆Searching...`,
        type: 'editreply'
    }, interaction);

    try {
        await client.distube.play(channel, query, {
            textChannel: interaction.channel,
            member: interaction.member
        });
    } catch (e) {
        return client.errNormal({
            error: `Error getting music. Please try again in a few minutes`,
            type: 'editreply'
        }, interaction);
    }
};
