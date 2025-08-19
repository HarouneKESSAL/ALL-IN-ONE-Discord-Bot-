const Discord = require('discord.js');
const Schema = require("../../database/models/verifyV2");

module.exports = async (client, interaction, args) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageGuild],
        perms: [Discord.PermissionsBitField.Flags.ManageGuild]
    }, interaction)

    if (perms == false) return;

    const enable = interaction.options.getBoolean('enable');
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const log = interaction.options.getChannel('log');

    if (enable) {
        const data = await Schema.findOne({ Guild: interaction.guild.id });
        if (data) {
            data.Channel = channel.id;
            data.Role = role.id;
            data.LogChannel = log.id;
            await data.save();
        }
        else {
            await Schema.create({ Guild: interaction.guild.id, Channel: channel.id, Role: role.id, LogChannel: log.id });
        }

        client.succNormal({
            text: `Verification panel has been successfully created`,
            fields: [
                {
                    name: `📘┆Channel`,
                    value: `${channel} (${channel.name})`,
                    inline: true
                },
                {
                    name: `📛┆Role`,
                    value: `${role} (${role.name})`,
                    inline: true
                },
                {
                    name: `📝┆Log channel`,
                    value: `${log} (${log.name})`,
                    inline: true
                }
            ],
            type: 'editreply'
        }, interaction);

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('verifyv2_begin')
                    .setLabel('Submit verification')
                    .setStyle(Discord.ButtonStyle.Primary),
            );

        client.embed({
            title: `${interaction.guild.name}・verification`,
            desc: `Click the button to submit your verification`,
            components: [row]
        }, channel)
    }
    else {
        await Schema.deleteOne({ Guild: interaction.guild.id });
        client.succNormal({
            text: `Verification panel has been successfully deleted`,
            type: 'editreply'
        }, interaction);
    }
};
