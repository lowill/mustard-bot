const { channelKeys } = require('@config/config.json');

module.exports = {
  name: 'paprika-strike-time-reminder',
  recurrenceRule: {
    hour: [10, 23],
    minute: 0,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    'channelKey': channelKeys.main
  },
  jobFunction: messageFn => {
    return messageFn(`<@&560457709254737920> It's Paprika crew strike time!`);
  }
};