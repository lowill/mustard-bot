module.exports = {
  name: 'koopachan',
  description: 'Posts a Koopa-Hime (Bowsette) meme image.',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/koopachan.png',
        name: 'koopachan.png'
      }]
    });
  }
};