const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete messages in the current channel')
        .addNumberOption(option => option.setName('amount').setDescription('Amount of messages to delete').setRequired(true)),

    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        const perms = await client.checkPerms({
            flags: [Discord.PermissionsBitField.Flags.ManageMessages],
            perms: [Discord.PermissionsBitField.Flags.ManageMessages]
        }, interaction);

        if (perms == false) return;

        const amount = interaction.options.getNumber('amount');

        if (amount > 100) return client.errNormal({
            error: 'I cannot delete more than 100 messages at a time!',
            type: 'editreply'
        }, interaction);

        if (amount < 1) return client.errNormal({
            error: 'I cannot delete less than 1 message!',
            type: 'editreply'
        }, interaction);

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            client.succNormal({
                text: `I have successfully deleted the messages`,
                fields: [
                    {
                        name: '💬┆Amount',
                        value: `${deleted.size}`,
                        inline: true
                    }
                ],
                type: 'ephemeraledit'
            }, interaction);
        } catch (err) {
            client.errNormal({
                error: 'There was an error trying to delete messages in this channel!',
                type: 'editreply'
            }, interaction);
        }
    },
};

