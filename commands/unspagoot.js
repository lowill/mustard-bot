const Config = require('@config/config.json');
const unjail = require('@jobs/unjail.js');
const commandName = `unspagoot`;
module.exports = {
  name: commandName,
  description: `Unjail the specified user.  Usage: ${'``'}${Config.prefix}${commandName} [user]${'``'}`,
  execute(message, args, resources) {
    const guildId = message.guild.id;
    const userArg = args[0];
    return resources.DiscordUtils.resolveUser(userArg)
      .then(user => {
        return unjail.fetchJob(resources.DB, user.id, guildId)
          .then(job => ({
            job,
            user
          }));
      })
      .then(res => {
        unjail.scheduleRemoval(resources.DiscordClient, 0, res.user.id, guildId, res.job.rowid);
      });
  }
}