module.exports = {
  name: 'esports',
  description: 'posts an eSports meme image',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/esports.png',
        name: 'esports.png'
      }]
    });
  }
};