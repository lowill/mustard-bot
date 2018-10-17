const fs = require('fs');
const Discord = require('discord.js');
const { channelKeys } = require('@config/config.json');

const imagePath = './images/mimlemel_halloween_2.png';
if(!fs.existsSync(imagePath)) {
  throw new Error(`File not found at ${imagePath}`);
}
const imageAttachment = new Discord.Attachment(imagePath);

module.exports = {
  name: 'daily-twitter-refresh-reminder-2',
  recurrenceRule: {
    hour: 4,
    minute: 55,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    channelKey: channelKeys.main
  },
  jobFunction: messageFn => {
    return messageFn(`Last call for toots!`, imageAttachment);
  }
};