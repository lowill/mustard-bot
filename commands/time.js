const moment = require('moment-timezone');
const { prefix } = require('@config/config.json');

const commandName = 'time';
const usage = `Usage: \`\`${prefix}${commandName} [timezone]\`\``;
const timeFormat = `dddd, MMMM Do YYYY - h:mm A zZ`;
module.exports = {
  name: commandName,
  description: `Gives the current time in a particular time zone.  Default: ('Asia/Tokyo'). ${usage}`,
  execute(message, args) {
    let timezone = args.shift();
    if(timezone === undefined || timezone === '') {
      timezone = 'Asia/Tokyo';
    }
    else if(!moment.tz.names().includes(timezone)) throw new Error(`Invalid timezone.  Please use a full format timezone like \`\`"Asia/Tokyo"\`\` or \`\`"America/New_York"\`\`  See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones for a complete list of timezones.`);
    const targetTime = moment().tz(timezone).format(timeFormat);
    return message.channel.send(targetTime);
  }
}

module.exports.test = {};
module.exports.test.timeFormat = timeFormat