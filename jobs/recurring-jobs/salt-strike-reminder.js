module.exports = {
  name: 'salt-strike-time-reminder',
  recurrenceRule: {
    hour: [23, 10],
    minute: 0,
    tz: 'Asia/Tokyo'
  },
  type: 'chat',
  data: {
    'channelKey': 'salt-lobby'
  },
  jobFunction: messageFn => {
    return messageFn(`It's strike time <@241753116796649483>`);
  }
};