const { prefix, ownerId } = require('@config/config.json');
module.exports = {
  name: 'set-presence',
  description: `Sets the presence (game name) of the bot. Usage: \`\`${prefix}set-presence [presence text]\`\``,
  permissions: 'owner',
  execute(message, args, resources) {
    const presenceText = message.content.substring(prefix.length + 1 + this.name.length);
    return resources.DiscordClient.user.setPresence({ game: { name: presenceText }, status: 'online' })
      .catch(console.error);
  }
}