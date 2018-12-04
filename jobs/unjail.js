const Config = require('@config/config.json');
const Channels = require('@config/channels.json').channels;
const DBUtils = require('@utils/DBUtils.js')
const DB = new DBUtils.Connection(Config.db_filename);
const moment = require('moment-timezone');
const schedule = require('node-schedule');

const jailTableName = `jailed_users`;
const jailRoleId = '404660387108225025';

const scheduledUnjails = new Map();

function fetchJailedUsers(db=DB, tableName=jailTableName) {
  return db.all(`
    SELECT ROWID, *
    FROM ${tableName}
  `);
}

function removeFromJail(discordClient, userId, guildId, jobId, roleId=404660387108225025) {
  return discordClient
    .guilds.get(guildId)
    .members.get(userId)
    .removeRole(roleId)
    .then(() => {
      if(jobId !== null) clearJob(DB, jobId);
      discordClient.channels.get(Channels.main.channelId).send(`<@${userId}> is free~`);

      const jobKey = getJobKey(userId, guildId);
      const existingJob = scheduledUnjails.get(jobKey);
      schedule.cancel(existingJob);
      scheduledUnjails.delete(jobKey);
    });
}

function clearJob(db=DB, jobId, tableName=jailTableName) {
  return db.run(`
    DELETE FROM
    ${tableName}
    WHERE ROWID=?
  `,
    [jobId]
  );
}

function fetchJob(db=DB, userId, guildId, tableName=jailTableName) {
  return db.get(`
    SELECT ROWID, *
    FROM ${tableName}
    WHERE user_id=? AND guild_id=?
  `,
    [userId, guildId]
  );
}

function getJobKey(userId, guildId) {
  return `user:${userId} guild:${guildId}`;
}

function scheduleRemoval(discordClient, timestamp, userId, guildId, jobId, roleId=jailRoleId) {
  const removalTime = moment.unix(timestamp);
  const date = removalTime.toDate();
  const currentTime = moment();
  const currentTimestamp = currentTime.unix();
  if(currentTimestamp > timestamp) {
    removeFromJail(discordClient, userId, guildId, jobId, roleId);
  }
  else {
    const job = schedule.scheduleJob(date, removeFromJail.bind({}, discordClient, userId, guildId, jobId, roleId));
    scheduledUnjails.set(getJobKey(userId, guildId), job);
  }
}

function queueJobs(discordClient) {
  fetchJailedUsers()
    .then(rows => {
      for(const row of rows) {
        const {
          rowid,
          user_id,
          guild_id,
          free_timestamp
        } = row;

        scheduleRemoval(discordClient, free_timestamp, user_id, guild_id, rowid, jailRoleId);
      }
    });
}

module.exports = {
  scheduleRemoval: scheduleRemoval,
  queueJobs: queueJobs,
  fetchJob: fetchJob
};