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
    return messageFn(`It's <@&530618905165692928> strike time`);
  }
};