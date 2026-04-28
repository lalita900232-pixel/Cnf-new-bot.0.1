const { EmbedBuilder } = require("discord.js");
const { data, saveData, ensureUser } = require("./data");
const config = require("./config");

function formatDuration(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function handleOnline(member, reply) {
  try {
    const userId = member.id;
    ensureUser(userId);
    if (data.users[userId].start) return; 

    data.users[userId].start = Date.now();
    saveData();

    let desc = `✅ **<@${userId}>** has started their session.`;
    let color = "#2ecc71";
    let title = "Status: ONLINE";

    // Restore Purane Features
    if (userId === config.SUPREME_LEADER_ID) {
        title = "👑 THE SUPREME COMMAND";
        desc = `⚡ **All hail <@${userId}>!** The ultimate authority is now active. ⚡`;
        color = "#ff0000";
    } else if (member.roles.cache.has(config.LEADER_ROLE_ID)) {
        desc = `🛡️ Leader **<@${userId}>** is watching.`;
        color = "#f1c40f";
    } else if (member.roles.cache.has(config.EXECUTIVE_ROLE_ID)) {
        desc = `🚨 **<@${userId}>** **Server tech** is active and available for help.`;
        color = "#3498db";
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
        .setDescription(desc)
        .addFields({ name: "Login Time", value: `<t:${Math.floor(Date.now() / 1000)}:t>` })
        .setTimestamp();

    return reply({ embeds: [embed] });
  } catch (e) { console.error(e); }
}

async function handleOffline(member, reply, isRestart = false) {
    try {
        const userId = member.id;
        ensureUser(userId);
        if (!data.users[userId].start) return;

        const duration = Date.now() - data.users[userId].start;
        data.users[userId].total += duration;
        data.users[userId].start = null;
        saveData();

        const embed = new EmbedBuilder()
            .setTitle(isRestart ? "🔄 RESTART SAVED" : "Status: OFFLINE")
            .setColor("#7f8c8d")
            .setDescription(`🔴 **<@${userId}>** session ended.`)
            .addFields({ name: "Session Length", value: `\`${formatDuration(duration)}\`` })
            .setTimestamp();

        return reply({ embeds: [embed] });
    } catch (e) { console.error(e); }
}

async function forceOfflineAll(client) {
    const guild = await client.guilds.fetch(config.TARGET_SERVER_ID).catch(() => null);
    if (!guild) return;
    for (const id in data.users) {
        if (data.users[id].start) {
            try {
                const m = await guild.members.fetch(id);
                await handleOffline(m, (o) => {}, true);
            } catch (e) { data.users[id].start = null; }
        }
    }
    saveData();
}

module.exports = { handleOnline, handleOffline, forceOfflineAll };
      
