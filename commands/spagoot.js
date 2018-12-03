const moment = require('moment-timezone');

const Config = require('@config/config.json');
const prefix = Config.prefix;
const DBUtils = require('@utils/DBUtils.js');
const DB = new DBUtils.Connection(Config.db_filename);
const unjail = require('@jobs/unjail.js');
const Utils = require('@utils/Utils.js');

const commandName = `spagoot`;
const jailTableName = `jailed_users`;
const jailHistoryTableName = `jail_history`;

const jailRoleId = '404660387108225025';

(function createJailTable(db=DB, tableName=jailTableName) {
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

(function createJailHistoryTable(db=DB, tableName=jailHistoryTableName) {
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
      FROM ${jailHistoryTableName}
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
}

function recordJail(db, userId, guildId, message) {
  return getJailCount(db, userId, guildId)
    .then(jail_count => {
      const next_jail_count = jail_count + 1;
      const jail_duration = moment.duration(getJailTime(jail_count), 'minutes');
      // const jail_duration = moment.duration(15, 'seconds'); // Test value
      const current_moment = moment();
      const free_time = current_moment.clone().add(jail_duration);
      const duration_humanized = jail_duration.humanize();

      return db.run(`
          INSERT INTO ${jailTableName} 
          ( user_id, guild_id, free_timestamp, start_timestamp, duration )
          VALUES
          ( ?, ?, ?, ?, ? )
        `,
          [userId, guildId, free_time.unix(), current_moment.unix(), duration_humanized]
      )
        .then(() => db.get(`SELECT last_insert_rowid()`))
        .then(lastInsert => {
          return db.run(`
            REPLACE INTO ${jailHistoryTableName}
            ( user_id, guild_id, jail_count )
            VALUES
            ( ?, ?, ? )
            `,
              [userId, guildId, next_jail_count]
            )
          .then(() => ({ freeTime: free_time.unix(), rowId: lastInsert['last_insert_rowid()'] }));
        }, err => {
          message.reply(`User is already ${commandName}'d`);
          console.error(`Failed to insert into ${jailTableName}, probably alread exists. `, err);
        })
        .then(() => {
          message.channel.send(`${jail_count + 1}${Utils.getNumberSuffix(jail_count)} ${commandName}.  New sentence is ${duration_humanized}.`);
        })
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
          .then(lastJob => {
            jailUser(resources.DiscordClient, user.id, guildId, jailRoleId)
              .then(lastJob => unjail.scheduleRemoval(resources.DiscordClient, lastJob.freeTime, user.id, guildId, lastJob.rowId, jailRoleId))
          })
      })
      .catch(err => {
        message.reply(`Failed to ${commandName} user.`);
        console.error(err);
      });
  }
};