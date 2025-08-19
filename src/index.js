const app = require("express")();
const Discord = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const envPath = './.env';

if (!fs.existsSync(envPath)) {
    console.error(`Missing ${envPath} file. Please create one before starting the bot.`);
    process.exit(1);
}

dotenv.config({ path: envPath });

const axios = require('axios');
const webhook = require("./config/webhooks.json");
const config = require("./config/bot.js");
const webHooksArray = ['startLogs', 'shardLogs', 'errorLogs', 'dmLogs', 'voiceLogs', 'serverLogs', 'serverLogs2', 'commandLogs', 'consoleLogs', 'warnLogs', 'voiceErrorLogs', 'creditLogs', 'evalLogs', 'interactionLogs'];
// Check if .env webhook_id and webhook_token are set
if (process.env.WEBHOOK_ID && process.env.WEBHOOK_TOKEN) {
    for (const webhookName of webHooksArray) {
        webhook[webhookName].id = process.env.WEBHOOK_ID;
        webhook[webhookName].token = process.env.WEBHOOK_TOKEN;
    }
}
console.clear();
console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), (chalk.green(`Starting up`)), (chalk.white(`...`)))
console.log(`\u001b[0m`)
console.log(chalk.blue(chalk.bold(`System`)), (chalk.white(`>>`)), chalk.red(`Version ${require(`${process.cwd()}/package.json`).version}`), (chalk.green(`loaded`)))
console.log(`\u001b[0m`);
const client = require('./bot');
app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<iframe style="margin: 0; padding: 0;" width="100%" height="100%" src="https://uoaio.vercel.app/" frameborder="0" allowfullscreen></iframe>`);
    res.end()
});
app.get("/dashboard", (req, res) => {
    const commands = [...client.commands.values()].map(cmd => ({
        name: cmd.data.name,
        description: cmd.data.description || 'No description',
    }));
    const automationsDir = path.join(__dirname, 'commands', 'autosetup');
    let automations = [];
    if (fs.existsSync(automationsDir)) {
        automations = fs.readdirSync(automationsDir)
            .filter(f => f.endsWith('.js'))
            .map(f => f.replace('.js', ''));
    }
    const commandItems = commands.map(c => `<li>${c.name} - ${c.description}</li>`).join('');
    const automationItems = automations.map(a => `<li>${a}</li>`).join('');
    res.send(`<html><head><title>Dashboard</title></head><body><h1>${client.user ? client.user.username : 'Bot'} Dashboard</h1><h2>Commands (${commands.length})</h2><ul>${commandItems}</ul><h2>Automations (${automations.length})</h2><ul>${automationItems}</ul></body></html>`);
});
app.listen(3000, () => console.log(chalk.blue(chalk.bold(`Server`)), (chalk.white(`>>`)), (chalk.green(`Running on`)), (chalk.red(`3000`))))

// Webhooks
const consoleLogs = new Discord.WebhookClient({
    id: webhook.consoleLogs.id,
    token: webhook.consoleLogs.token,
});

const warnLogs = new Discord.WebhookClient({
    id: webhook.warnLogs.id,
    token: webhook.warnLogs.token,
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    if (error) if (error.length > 950) error = error.slice(0, 950) + '... view console for details';
    if (error.stack) if (error.stack.length > 950) error.stack = error.stack.slice(0, 950) + '... view console for details';
    if (!error.stack) return
    const embed = new Discord.EmbedBuilder()
        .setTitle(`🚨・Unhandled promise rejection`)
        .addFields([
            {
                name: "Error",
                value: error ? Discord.codeBlock(error) : "No error",
            },
            {
                name: "Stack error",
                value: error.stack ? Discord.codeBlock(error.stack) : "No stack error",
            }
        ])
    consoleLogs.send({
        username: 'Bot Logs',
        embeds: [embed],
    }).catch(() => {
        console.log('Error sending unhandled promise rejection to webhook')
        console.log(error)
    })
});

process.on('warning', warn => {
    console.warn("Warning:", warn);
    const embed = new Discord.EmbedBuilder()
        .setTitle(`🚨・New warning found`)
        .addFields([
            {
                name: `Warn`,
                value: `\`\`\`${warn}\`\`\``,
            },
        ])
    warnLogs.send({
        username: 'Bot Logs',
        embeds: [embed],
    }).catch(() => {
        console.log('Error sending warning to webhook')
        console.log(warn)
    })
});
