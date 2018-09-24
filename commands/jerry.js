module.exports = {
  name: 'jerry',
  description: 'Posts a Jerry meme image.',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/jerry.png',
        name: 'jerry.png'
      }]
    });
  }
};