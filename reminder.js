const { EmbedBuilder } = require("discord.js");

const starters = ["Still offline?", "Oh wow noob,", "Look who’s missing,", "Attendance check failed!", "System alert:", "Attendance police here,"];
const middles = ["even bots are more active than you", "your login button is on vacation", "you’re mastering ghost mode", "you’re in professional AFK mode"];
const endings = ["log in before we forget you.", "clan is disappointed.", "wake up soldier.", "report immediately."];

function generateSavageMessage() {
  const s = starters[Math.floor(Math.random() * starters.length)];
  const m = middles[Math.floor(Math.random() * middles.length)];
  const e = endings[Math.floor(Math.random() * endings.length)];
  return `${s} ${m} — ${e}`;
}

function getReminderEmbed(userId) {
  return new EmbedBuilder()
    .setColor("#ff0000")
    .setTitle("🚨 ATTENDANCE REMINDER")
    .setDescription(`<@${userId}> ${generateSavageMessage()}`)
    .setTimestamp();
}

module.exports = { getReminderEmbed };

