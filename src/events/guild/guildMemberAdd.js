const discord = require('discord.js');

const roleSchema = require("../../database/models/joinRole");
const verifySchema = require("../../database/models/verifyV2");

module.exports = async (client, member) => {
    const data = await roleSchema.findOne({ Guild: member.guild.id })
    if (data) {
        const role = member.guild.roles.cache.get(data.Role);
        if (!role) return;

        member.roles.add(role).catch(() => { });
    }

    const verifyData = await verifySchema.findOne({ Guild: member.guild.id });
    if (verifyData) {
        const unverified = member.guild.roles.cache.get(verifyData.Role);
        if (unverified) {
            member.roles.add(unverified).catch(() => { });
        }
    }
};