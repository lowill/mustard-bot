module.exports = {
  name: 'wheeze',
  description: 'Posts a wheeze meme image.',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/wheeze.jpg',
        name: 'wheeze.jpg'
      }]
    });
  }
};