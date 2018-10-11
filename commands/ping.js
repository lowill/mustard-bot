module.exports = {
  name: 'ping',
  description: 'Replies with "Pong!".',
  execute(message, args) {
    return message.channel.send('Pong!');
  }
};