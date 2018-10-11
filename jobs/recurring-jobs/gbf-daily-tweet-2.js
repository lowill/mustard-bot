const { channelKeys } = require('@config/config.json');

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
    return messageFn(`Last call for toots!`, {
      files: [{
        attachment: './images/mimlemel2.png',
        name: 'mimlemel2.png'
      }]
    });
  }
};