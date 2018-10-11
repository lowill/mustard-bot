const { channelKeys } = require('@config/config.json');

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
    return messageFn(`@here It's tootin' time!`, {
      files: [{
        attachment: './images/toot.png',
        name: 'toot.png'
      }]
    });
  }
};