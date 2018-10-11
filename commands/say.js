// Talks to Salt and Pepper lobby
const { prefix, channelKeys, ownerId } = require('@config/config.json');
const targetChannelId = require('@config/channels.json').channels[channelKeys.main].channelId;

module.exports = {
  name: 'say',
  description: 'Makes the bot speak (in the lobby channel).',
  permissions: 'owner',
  execute(message, args, resources) {
    // prefix + space + say
    message = message.content.substring(prefix.length + 4);
    return resources.DiscordClient.channels.get(targetChannelId).send(message);
  }
}

