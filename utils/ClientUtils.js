const Discord = require('discord.js');
function ClientUtils(client) {
  if(!client instanceof Discord.Client) throw new Error('ClientUtils must accept a Discord.js Client object.');
  return {
    chatFactory: function(channelId) {
      return (message, options) => client.channels.get(channelId).send(message, options);
    },
    // TODO: Filter by guild/server so we are generally always getting the right emoji
    getEmoji: function(emojiName) {
      return `<:${emojiName}:${client.emojis.find(item => item['name'] === emojiName).id}>`;
    }
  };
};

module.exports = ClientUtils;