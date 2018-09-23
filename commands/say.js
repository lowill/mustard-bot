// Talks to Salt and Pepper lobby
const targetChannelId = require('../channels.json').channels['salt-lobby'].channelId;
const { prefix } = require('../config.json');
module.exports = {
  name: 'say',
  description: 'says things',
  execute(message, args, resources) {
    // Only allow us to use this command
    if(message.author.id !== '161221472495468544') return;

    // prefix + space + say
    message = message.content.substring(prefix.length + 4);
    resources.DiscordClient.channels.get(targetChannelId).send(message);
  }
}

