module.exports = {
  name: 'schwing',
  description: 'Posts a schwing meme image.',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/schwing.jpg',
        name: 'schwing.jpg'
      }]
    });
  }
};