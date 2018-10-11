const { prefix, ownerId } = require('@config/config.json');

module.exports = {
  name: 'unban',
  description: `Unbans a user by id. Usage: \`\`${prefix}unban [Discord User ID]\`\``,
  permissions: 'admin',
  execute(message, args) {
    const target = args.shift();
    return message.guild.unban(target);
  }
}