const { channelKeys } = require('@config/config.json');

module.exports = {
  name: 'pepper-strike-time-reminder',
  recurrenceRule: {
    hour: [23, 11],
    minute: 0,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    'channelKey': channelKeys.main
  },
  jobFunction: messageFn => {
    return messageFn(`It's Pepper Crew strike time <@241753116796649483>`);
  }
};