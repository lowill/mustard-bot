module.exports = {
  name: 'espanorts',
  description: 'posts a spanish esports meme image',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/espanorts.png',
        name: 'espanorts.png'
      }]
    });
  }
};