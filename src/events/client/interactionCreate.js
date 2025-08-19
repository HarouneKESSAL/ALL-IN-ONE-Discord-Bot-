const Discord = require('discord.js');
const Captcha = require("@haileybot/captcha-generator");

const reactionSchema = require("../../database/models/reactionRoles");
const banSchema = require("../../database/models/userBans");
const verify = require("../../database/models/verify");
const Commands = require("../../database/models/customCommand");
const CommandsSchema = require("../../database/models/customCommandAdvanced");
const applicationSchema = require("../../database/models/applicationChannels");

const verifyV2 = require("../../database/models/verifyV2");

module.exports = async (client, interaction) => {
    // Commands
    if (interaction.isCommand() || interaction.isUserContextMenuCommand()) {
        banSchema.findOne({ User: interaction.user.id }, async (err, data) => {
            if (data) {
                return client.errNormal({
                    error: "You have been banned by the developers of this bot",
                    type: 'ephemeral'
                }, interaction);
            }
            else {
                const cmd = client.commands.get(interaction.commandName);
                if (!cmd) {
                    const cmdd = await Commands.findOne({
                        Guild: interaction.guild.id,
                        Name: interaction.commandName,
                    });
                    if (cmdd) {
                        return interaction.channel.send({ content: cmdd.Responce });
                    }

                    const cmdx = await CommandsSchema.findOne({
                        Guild: interaction.guild.id,
                        Name: interaction.commandName,
                    });
                    if (cmdx) {
                        // Remove interaction
                        if (cmdx.Action == "Normal") {
                            return interaction.reply({ content: cmdx.Responce });
                        } else if (cmdx.Action == "Embed") {
                            return client.simpleEmbed(
                                {
                                    desc: `${cmdx.Responce}`,
                                    type: 'reply'
                                },
                                interaction,
                            );
                        } else if (cmdx.Action == "DM") {
                            await interaction.deferReply({ ephemeral: true });
                            interaction.editReply({ content: "I have sent you something in your DMs" });
                            return interaction.user.send({ content: cmdx.Responce }).catch((e) => {
                                client.errNormal(
                                    {
                                        error: "I can't DM you, maybe you have DM turned off!",
                                        type: 'ephemeral'
                                    },
                                    interaction,
                                );
                            });
                        }
                    }
                }
                if (interaction.options._subcommand !== null && interaction.options.getSubcommand() == "help") {
                    const cmdInfo = interaction.client.getSlashMentions(interaction.commandName)

                    return client.embed({
                        title: `❓・Help panel`,
                        desc: `Get help with the commands in \`${interaction.commandName}\` \n\n${cmdInfo.map((info) /* array of [cmd_mention, description] */=> `${info[0]} - \`${info[1]}\``).join("\n")}`,
                        type: 'reply'
                    }, interaction)
                }

                if (cmd) cmd.run(client, interaction, interaction.options._hoistedOptions).catch(err => {
                    client.emit("errorCreate", err, interaction.commandName, interaction)
                })
            }
        })
    }

    // Verify system
    if (interaction.isButton() && interaction.customId == "Bot_verify") {
        const data = await verify.findOne({ Guild: interaction.guild.id, Channel: interaction.channel.id });
        if (data) {
            let captcha = new Captcha();

            try {
                var image = new Discord.AttachmentBuilder(captcha.JPEGStream, { name: "captcha.jpeg" });

                interaction.reply({ files: [image], fetchReply: true }).then(function (msg) {
                    const filter = s => s.author.id == interaction.user.id;

                    interaction.channel.awaitMessages({ filter, max: 1 }).then(response => {
                        if (response.first().content === captcha.value) {
                            response.first().delete();
                            msg.delete();

                            client.succNormal({
                                text: "You have been successfully verified!"
                            }, interaction.user).catch(error => { })

                            var verifyUser = interaction.guild.members.cache.get(interaction.user.id);
                            verifyUser.roles.add(data.Role);
                        }
                        else {
                            response.first().delete();
                            msg.delete();

                            client.errNormal({
                                error: "You have answered the captcha incorrectly!",
                                type: 'editreply'
                            }, interaction).then(msgError => {
                                setTimeout(() => {
                                    msgError.delete();
                                }, 2000)
                            })
                        }
                    })
                })
            }
            catch (error) {
                console.log(error)
            }
        }
        else {
            client.errNormal({
                error: "Verify is disabled in this server! Or you are using the wrong channel!",
                type: 'ephemeral'
            }, interaction);
        }
    }

    // Advanced verify system
    if (interaction.isButton() && interaction.customId === 'verifyv2_begin') {
        const data = await verifyV2.findOne({ Guild: interaction.guild.id, Channel: interaction.channel.id });
        if (!data) return;

        const modal = new Discord.ModalBuilder()
            .setCustomId('verifyv2_modal')
            .setTitle('Server verification');

        const nameInput = new Discord.TextInputBuilder()
            .setCustomId('verifyv2_name')
            .setLabel('Your name')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const selfieInput = new Discord.TextInputBuilder()
            .setCustomId('verifyv2_selfie')
            .setLabel('Selfie URL')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(nameInput),
            new Discord.ActionRowBuilder().addComponents(selfieInput),
        );

        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verifyv2_modal') {
        const data = await verifyV2.findOne({ Guild: interaction.guild.id });
        if (!data) return;
        const name = interaction.fields.getTextInputValue('verifyv2_name');
        const selfie = interaction.fields.getTextInputValue('verifyv2_selfie');

        const logChannel = interaction.guild.channels.cache.get(data.LogChannel);
        if (logChannel) {
            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId(`verifyv2_approve_${interaction.user.id}`)
                    .setLabel('Approve')
                    .setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId(`verifyv2_decline_${interaction.user.id}`)
                    .setLabel('Decline')
                    .setStyle(Discord.ButtonStyle.Danger)
            );

            client.embed({
                title: `Verification request`,
                desc: `User: ${interaction.user}\nName: ${name}\nSelfie: [link](${selfie})`,
                image: selfie,
                components: [row]
            }, logChannel);
        }

        return interaction.reply({ content: 'Your verification has been submitted.', ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId.startsWith('verifyv2_')) {
        const parts = interaction.customId.split('_');
        const action = parts[1];
        const userId = parts[2];
        const data = await verifyV2.findOne({ Guild: interaction.guild.id });
        if (!data) return;

        if (action === 'approve') {
            const member = interaction.guild.members.cache.get(userId);
            if (member) {
                const role = interaction.guild.roles.cache.get(data.Role);
                if (role) member.roles.remove(role).catch(() => { });

                const access = interaction.guild.roles.cache.get(data.AccessRole);
                if (access) member.roles.add(access).catch(() => { });

            }
            interaction.update({ content: `✅ Approved <@${userId}>`, embeds: interaction.message.embeds, components: [] });
        }
        else if (action === 'decline') {
            interaction.update({ content: `❌ Declined <@${userId}>`, embeds: interaction.message.embeds, components: [] });
        }
    }

    // Reaction roles button
    if (interaction.isButton()) {
        var buttonID = interaction.customId.split("-");

        if (buttonID[0] == "reaction_button") {
            reactionSchema.findOne({ Message: interaction.message.id }, async (err, data) => {
                if (!data) return;

                const [roleid] = data.Roles[buttonID[1]];

                if (interaction.member.roles.cache.get(roleid)) {
                    interaction.guild.members.cache.get(interaction.user.id).roles.remove(roleid).catch(error => { })

                    interaction.reply({ content: `<@&${roleid}> was removed!`, ephemeral: true });
                }
                else {
                    interaction.guild.members.cache.get(interaction.user.id).roles.add(roleid).catch(error => { })

                    interaction.reply({ content: `<@&${roleid}> was added!`, ephemeral: true });
                }
            })
        }
    }

    // Reaction roles select
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId == "reaction_select") {
            reactionSchema.findOne(
                { Message: interaction.message.id },
                async (err, data) => {
                    if (!data) return;

                    let roles = "";

                    for (let i = 0; i < interaction.values.length; i++) {
                        const [roleid] = data.Roles[interaction.values[i]];

                        roles += `<@&${roleid}> `;

                        if (interaction.member.roles.cache.get(roleid)) {
                            interaction.guild.members.cache
                                .get(interaction.user.id)
                                .roles.remove(roleid)
                                .catch((error) => { });
                        } else {
                            interaction.guild.members.cache
                                .get(interaction.user.id)
                                .roles.add(roleid)
                                .catch((error) => { });
                        }

                        if ((i + 1) === interaction.values.length) {
                            interaction.reply({
                                content: `I have updated the following roles for you: ${roles}`,
                                ephemeral: true,
                            });
                        }
                    }
                }
            );
        }
    }
    // Tickets
    if (interaction.customId == "Bot_openticket") {
        return require(`${process.cwd()}/src/commands/tickets/create.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_closeticket") {
        return require(`${process.cwd()}/src/commands/tickets/close.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_claimTicket") {
        return require(`${process.cwd()}/src/commands/tickets/claim.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_transcriptTicket") {
        return require(`${process.cwd()}/src/commands/tickets/transcript.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_openTicket") {
        return require(`${process.cwd()}/src/commands/tickets/open.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_deleteTicket") {
        return require(`${process.cwd()}/src/commands/tickets/delete.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_noticeTicket") {
        return require(`${process.cwd()}/src/commands/tickets/notice.js`)(client, interaction);
    }

    if (interaction.customId == "Bot_apply") {
        const data = await applicationSchema.findOne({ Guild: interaction.guild.id });
        if (!data) return client.errNormal({ error: "The application system is not set up!", type: 'ephemeral' }, interaction);


        const options = data.Roles.map(r => {
            const role = interaction.guild.roles.cache.get(r);
            return {
                label: role ? role.name : r,
                value: r
            };
        });

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.StringSelectMenuBuilder()
                .setCustomId('applyRole')
                .setPlaceholder('Select a role')
                .addOptions(options)
        );

        return interaction.reply({ content: 'Select the role you want to apply for:', components: [row], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId == 'applyRole') {
        const data = await applicationSchema.findOne({ Guild: interaction.guild.id });
        if (!data) return client.errNormal({ error: "The application system is not set up!", type: 'ephemeral' }, interaction);

        const roleId = interaction.values[0];


        const modal = new Discord.ModalBuilder()
            .setCustomId('applyModal')
            .setTitle('Application')
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId('application')
                        .setLabel('Why do you want to apply?')
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );
        await interaction.showModal(modal);

        const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id
        }).catch(() => { });

        if (!submitted) return;

        const response = submitted.fields.getTextInputValue('application');
        const logChannel = interaction.guild.channels.cache.get(data.Log);

        const embed = new Discord.EmbedBuilder()
            .setTitle('📨・New application')
            .addFields(
                { name: 'User', value: `${interaction.user}`, inline: true },
                { name: 'Role', value: `<@&${roleId}>`, inline: true },
                { name: 'Application', value: response }
            )
            .setColor(client.config.colors.normal);

        logChannel.send({ content: `<@&${roleId}>`, embeds: [embed] });

        client.succNormal({ text: `Application successfully submitted!`, type: 'ephemeral' }, submitted);
    }
}

