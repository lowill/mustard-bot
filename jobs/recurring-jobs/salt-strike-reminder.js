const { channelKeys } = require('@config/config.json');

module.exports = {
  name: 'salt-strike-time-reminder',
  recurrenceRule: {
    hour: [22, 23],
    minute: 0,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    'channelKey': channelKeys.main
  },
  jobFunction: messageFn => {
    return messageFn(`It's S.A.L.T. Crew strike time`);
  }
};