const { prefix } = require('@config/config.json');
module.exports = {
  name: 'tavi',
  description: `Posts the Tavi twitch clip. Usage: \`\`${prefix}tavi\`\``,
  execute(message, args) {
    return message.channel.send('https://clips.twitch.tv/RelentlessSleepyTruffleHoneyBadger');
  }
};