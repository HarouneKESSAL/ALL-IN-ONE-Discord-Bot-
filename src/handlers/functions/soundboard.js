const Discord = require('discord.js');
const https = require('https');
const { AudioPlayerStatus, createAudioResource, createAudioPlayer, NoSubscriberBehavior, joinVoiceChannel, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');

var servers = {}

module.exports = (client) => {

    client.soundboard = async function (guild, interaction, url) {
        if (!servers[guild]) servers[guild] = {
            queue: []
        }

        var server = servers[guild];

        server.queue.push(url);

        const player = createAudioPlayer();

        const channel = interaction.member.voice.channel;
        const connection = await client.connectToChannel(channel);
        connection.subscribe(player);

        setTimeout(() => {
            if (channel.type == Discord.ChannelType.GuildStageVoice) {
                interaction.guild.members.me.voice.setSuppressed(false);
            }
        }, 500)

        client.play(connection, interaction, guild, player);
    }

    client.play = async function (connection, interaction, guild, player) {
        var server = servers[guild];

        const url = server.queue[0];
        const req = https.get(url, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Request failed with status code: ${res.statusCode}`);
                res.resume();
                connection.destroy();
                return;
            }

            res.on('error', (err) => {
                console.error('Stream error:', err);
                res.destroy();
                req.destroy();
                connection.destroy();
            });

            const resource = createAudioResource(res, { inputType: StreamType.Arbitrary });
            player.play(resource);

            server.queue.shift();

            player.once(AudioPlayerStatus.Idle, () => {
                res.destroy();
                req.destroy();
                if (server.queue[0]) {
                    client.play(connection, interaction, guild, player);
                }
                else {
                    connection.destroy();
                }
            });
        });

        req.on('error', (err) => {
            console.error('HTTP request error:', err);
            connection.destroy();
        });

        req.setTimeout(15000, () => {
            console.error('HTTP request timeout');
            req.destroy();
            connection.destroy();
        });
    }
}
