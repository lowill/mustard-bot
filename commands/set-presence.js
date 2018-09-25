const { prefix, ownerId } = require('../config.json');
module.exports = {
  name: 'set-presence',
  description: 'Sets the presence (game name) of the bot.',
  execute(message, args, resources) {
    // Only allow us to use the command
    if(message.author.id !== ownerId) return;

    const presenceText = message.content.substring(prefix.length + 1 + this.name.length);
    resources.DiscordClient.user.setPresence({ game: { name: presenceText }, status: 'online' })
      .catch(console.error);
  }
}