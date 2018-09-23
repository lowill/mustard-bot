module.exports = {
  recurrenceRule: {
    hour: 4,
    minute: 30,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    channelKey: 'salt-lobby'
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