const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const Discord = require('discord.js');

const Schema = require("../../database/models/applicationChannels");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Manage the apply system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the apply system')
                .addChannelOption(option => option.setName('channel').setDescription('The channel for the apply message').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addStringOption(option => option.setName('roles').setDescription('Roles to mention on application logs').setRequired(true))
                .addChannelOption(option => option.setName('log').setDescription('The channel for the application logs').setRequired(true).addChannelTypes(ChannelType.GuildText))
        ),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */
    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        const perms = await client.checkUserPerms({
            flags: [Discord.PermissionsBitField.Flags.Administrator],
            perms: [Discord.PermissionsBitField.Flags.Administrator]
        }, interaction);
        if (perms == false) return;

        const channel = interaction.options.getChannel('channel');
        const roles = interaction.options.getString('roles').match(/\d+/g);
        const log = interaction.options.getChannel('log');

        Schema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
            if (!data) {
                new Schema({
                    Guild: interaction.guild.id,
                    Channel: channel.id,
                    Log: log.id,
                    Roles: roles
                }).save();
            }
            else {
                data.Channel = channel.id;
                data.Log = log.id;
                data.Roles = roles;
                data.save();
            }
        });

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('Bot_apply')
                .setLabel('Apply')
                .setStyle(Discord.ButtonStyle.Primary)
        );

        const embed = new Discord.EmbedBuilder()
            .setTitle('📋・Applications')
            .setDescription('Click the button below to submit your application.')
            .setColor(client.config.colors.normal);

        channel.send({ embeds: [embed], components: [row] });

        client.succNormal({ text: `Application system successfully setup!`, type: 'ephemeraledit' }, interaction);
    },
};
