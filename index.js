const { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const config = require('./config');
const { handleOnline, handleOffline, forceOfflineAll } = require('./attendance');
const { getReminderEmbed } = require('./reminder');
const { data, saveData } = require('./data');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('ＧＡＮＡＫＡ Online ✅'));
app.listen(process.env.PORT || 8080);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

// Stability Alerts
async function sendUpdate(title, message, isError = false) {
    try {
        const channel = await client.channels.fetch(config.TARGET_CHANNEL_ID).catch(() => null);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor(isError ? "#ff0000" : "#2ecc71")
                .setTimestamp();
            await channel.send({ embeds: [embed] });
        }
    } catch (e) { console.error("Update failed:", e); }
}

client.once('ready', async () => {
    console.log("🚀 Bot is Ready!");
    await sendUpdate("**⚠️ Maintenance Alert**", "**Bot is ready for commands!**");
    
    const cmds = [
        new SlashCommandBuilder().setName('help').setDescription('View bot manual'),
        new SlashCommandBuilder().setName('restart').setDescription('Safe reboot'),
        new SlashCommandBuilder().setName('testreminder').setDescription('Manual savage poke').addUserOption(o=>o.setName('target').setDescription('User').setRequired(true)),
        new SlashCommandBuilder().setName('setslot').setDescription('Custom role msg').addIntegerOption(o=>o.setName('number').setDescription('1-3').setRequired(true)).addStringOption(o=>o.setName('roleid').setDescription('ID').setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Msg').setRequired(true)),
        new SlashCommandBuilder().setName('announce').setDescription('Send announcement')
            .addStringOption(o=>o.setName('title').setDescription('Heading').setRequired(true))
            .addStringOption(o=>o.setName('message').setDescription('Body text').setRequired(true))
            .addChannelOption(o=>o.setName('channel').setDescription('Target channel'))
    ];
    const rest = new REST({ version: '10' }).setToken(config.TOKEN);
    await rest.put(Routes.applicationCommands(config.CLIENT_ID), { body: cmds });
});

// Anti-Crash
process.on('unhandledRejection', async (reason) => {
    console.error(reason);
    await sendUpdate("⚠️ System Warning", `Unexpected Error: \`\`\`${reason}\`\`\``, true);
});

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild || msg.channel.id !== config.TARGET_CHANNEL_ID) return;
    const content = msg.content.toLowerCase().trim();
    try {
        if (content === 'online') { await msg.delete().catch(()=>{}); await handleOnline(msg.member, (o)=>msg.channel.send(o)); }
        if (content === 'offline') { await msg.delete().catch(()=>{}); await handleOffline(msg.member, (o)=>msg.channel.send(o)); }
    } catch (err) { console.error(err); }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
        if (interaction.commandName === 'help') {
            const helpEmbed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('📖 GANAKA Guide')
                .setDescription('Welcome to the official Ganaka system.')
                .addFields(
                    { name: '👤 Public Commands', value: 'Type `online` to start session.\nType `offline` to end session.' },
                    { name: '🛡️ Admin Commands', value: '`/setslot`: Set custom role messages.\n`/testreminder`: Send a manual savage poke.\n`/announce`: Send a global announcement.\n`/restart`: Safe system reboot.' }
                );
            return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
        }

        if (!config.ADMIN_IDS.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Unauthorized Access", ephemeral: true });
        }

        if (interaction.commandName === 'testreminder') {
            const target = interaction.options.getUser('target');
            const ch = await client.channels.fetch(config.TARGET_CHANNEL_ID);
            await ch.send({ content: `<@${target.id}>`, embeds: [getReminderEmbed(target.id)] });
            await interaction.reply({ content: "✅ Reminder sent.", ephemeral: true });
        }

        if (interaction.commandName === 'restart') {
            await interaction.reply("🔄 Saving data and restarting...");
            await forceOfflineAll(client);
            setTimeout(() => process.exit(0), 3000);
        }
        // ... (Baaki setslot aur announce same purane code ki tarah)
    } catch (err) { console.error(err); }
});

client.login(config.TOKEN);
                
