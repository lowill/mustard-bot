module.exports = {
  name: 'tavi',
  description: 'Posts the Tavi twitch clip.',
  execute(message, args) {
    message.channel.send('https://clips.twitch.tv/RelentlessSleepyTruffleHoneyBadger');
  }
};