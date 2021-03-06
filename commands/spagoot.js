const moment = require('moment-timezone');

const Config = require('@config/config.json');
const Constants = require('@constants/Constants.js');
const prefix = Config.prefix;
const DBUtils = require('@utils/DBUtils.js');
const DB = new DBUtils.Connection(Config.db_filename);
const unjail = require('@jobs/unjail.js');
const Utils = require('@utils/Utils.js');

const commandName = `spagoot`;

const jailRoleId = '404660387108225025';

(function createJailTable(db=DB, tableName=Constants.jailTableName) {
  return db.run(`
      CREATE TABLE
      IF NOT EXISTS ${tableName}
      (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        free_timestamp TEXT NOT NULL,
        start_timestamp TEXT,
        duration TEXT,
        PRIMARY KEY(user_id, guild_id)
      )
    `);
}());

(function createJailHistoryTable(db=DB, tableName=Constants.jailHistoryTableName) {
  return db.run(`
      CREATE TABLE
      IF NOT EXISTS ${tableName}
      (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        jail_count INTEGER NOT NULL,
        PRIMARY KEY(user_id, guild_id)
      )
    `);
}());


function getJailCount(db, userId, guildId) {
  return db.get(`
      SELECT jail_count
      FROM ${Constants.jailHistoryTableName}
      WHERE user_id=? AND guild_id=?
       `,
        [userId, guildId]
    )
      .then(
        res => res ? res.jail_count : 0,
        err => {console.error(err); return 0;}
      );
}

function getJailTime(count) {
  return count * 5 + 30;
  // return 1;
}

function recordJail(db, userId, guildId, message) {
  return getJailCount(db, userId, guildId)
    .then(jail_count => {
      const next_jail_count = jail_count + 1;
      const jail_duration = moment.duration(getJailTime(jail_count), 'minutes');
      // const jail_duration = moment.duration(15, 'seconds'); // Test value
      const current_moment = moment();
      const free_time = current_moment.clone().add(jail_duration);
      // const duration_humanized = jail_duration.humanize();
      const duration_humanized = `${jail_duration.asMinutes()} minutes`;

      return db.run(`
          INSERT INTO ${Constants.jailTableName} 
          ( user_id, guild_id, free_timestamp, start_timestamp, duration )
          VALUES
          ( ?, ?, ?, ?, ? )
        `,
          [userId, guildId, free_time.unix(), current_moment.unix(), duration_humanized]
      )
        .then(() => db.get(`SELECT last_insert_rowid()`))
        .then(lastInsert => {
          return db.run(`
            REPLACE INTO ${Constants.jailHistoryTableName}
            ( user_id, guild_id, jail_count )
            VALUES
            ( ?, ?, ? )
            `,
              [userId, guildId, next_jail_count]
            )
          .then(() => message.channel.send(`${next_jail_count}${Utils.getNumberSuffix(next_jail_count)} ${commandName}.  You are sentenced to ${duration_humanized} in 🍝.`))
          .then(() => ({ freeTime: free_time.unix(), rowId: lastInsert['last_insert_rowid()'] }));
        }, err => {
          message.reply(`User is already ${commandName}'d`);
          console.error(`Failed to insert into ${Constants.jailTableName}, probably alread exists. `, err);
        });
    })
}

function jailUser(discordClient, userId, guildId, roleId=jailRoleId) {
  return discordClient
    .guilds.get(guildId)
    .members.get(userId)
    .addRole(roleId);
}

module.exports = {
  name: commandName,
  description: `Sends user to jail.  Usage: ${'``'}${prefix}${commandName} [user]${'``'}`,
  permissions: `officer`,
  execute(message, args, resources) {
    const guildId = message.guild.id;
    const userArg = args[0];

    return resources.DiscordUtils.resolveUser(userArg)
      .then(user => {
        recordJail(resources.DB, user.id, guildId, message)
          .then(job => {
            jailUser(resources.DiscordClient, user.id, guildId, jailRoleId)
              .then(() => {
                unjail.scheduleRemoval(resources.DiscordClient, job.freeTime, user.id, guildId, job.rowId, jailRoleId)
              });
          })
      })
      .catch(err => {
        message.reply(`Failed to ${commandName} user.`);
        console.error(err);
      });
  }
};