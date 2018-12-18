const moment = require('moment-timezone');
const Config = require('@config/config.json');
const unjail = require('@jobs/unjail.js');
const commandName = `unspagoot`;
module.exports = {
  name: commandName,
  description: `Unjail the specified user.  Usage: ${'``'}${Config.prefix}${commandName} [user]${'``'}`,
  permissions: `officer`,
  execute(message, args, resources) {
    const guildId = message.guild.id;
    const userArg = args[0];
    return resources.DiscordUtils.resolveUser(userArg)
      .then(user => {
        return unjail.fetchJob(resources.DB, user.id, guildId)
          .then(job => {
            return job ? { job, user} : { job: { rowid: null }, user };
          });
      })
      .then(res => {
        const removalTime = moment().add(1, 'second'); // Schedule for 1 second in advance to avoid any issues
        unjail.scheduleRemoval(resources.DiscordClient, removalTime.unix(), res.user.id, guildId, res.job.rowid);
      });
  }
}