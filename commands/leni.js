module.exports = {
  name: 'leni',
  description: 'posts a leni meme image',
  execute(message, args) {
    message.channel.send('', {
      files: [{
        attachment: './images/who_is_leni.jpg',
        name: 'who_is_leni.jpg'
      }]
    });
  }
};