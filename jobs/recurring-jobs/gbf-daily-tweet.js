const fs = require('fs');
const Discord = require('discord.js');
const { channelKeys } = require('@config/config.json');

const imagePath = './images/hallotoot.png';
if(!fs.existsSync(imagePath)) {
  throw new Error(`File not found at ${imagePath}`);
}
const imageAttachment = new Discord.Attachment(imagePath);

module.exports = {
  name: 'daily-twitter-refresh-reminder',
  recurrenceRule: {
    hour: 4,
    minute: 30,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    channelKey: channelKeys.main
  },
  jobFunction: messageFn => {
    return messageFn(`<@&505844562737102848> It's tootin' time!`, imageAttachment);
  }
};