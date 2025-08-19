const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    const channel = interaction.options.getChannel('channel');

    const modal = new Discord.ModalBuilder()
        .setCustomId('announcementCreate')
        .setTitle('Create announcement')
        .addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('announcementMessage')
                    .setLabel('Announcement message')
                    .setStyle(Discord.TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );

    await interaction.showModal(modal);

    const submitted = await interaction.awaitModalSubmit({
        filter: i => i.user.id === interaction.user.id && i.customId === 'announcementCreate',
        time: 300000
    }).catch(() => null);

    if (!submitted) return;

    const message = submitted.fields.getTextInputValue('announcementMessage');

    client.embed({
        title: `📢・Announcement!`,
        desc: message
    }, channel);

    client.succNormal({
        text: `Announcement has been sent successfully!`,
        fields: [
            {
                name: `📘┆Channel`,
                value: `${channel} (${channel.name})`
            }
        ],
        type: 'ephemeral'
    }, submitted);
};

