const Discord = require('discord.js');
const moment = require('moment-timezone');
const Constants = require('@constants/Constants.js');
const DEFAULT_THRESHOLD = 14;
const { prefix } = require('@config/config.json');

const DiscordUtils = require('@utils/DiscordUtils.js')({});

module.exports = {
  name: 'get-inactive',
  description: `Assembles a list of users who have not participated in chat for the specified number of days (default 14). Usage: \`\`${prefix}get-inactive [days:integer]\`\``,
  permissions: `officer`,
  execute(message, args, resources) {
    const arg = args.shift();
    let days;
    if(typeof arg === 'undefined') {
      days = DEFAULT_THRESHOLD;
    }
    else if(arg.match(/\d+/) !== null) {
      days = parseInt(arg);
    }
    else throw new Error(`Days inactive must be a positive integer.`);

    const currentMoment = moment();
    const thresholdTimestamp = currentMoment.clone().subtract(days, 'days').valueOf();

    // WHERE last_active < ${thresholdTimestamp}
    const inactiveUsers = resources.DB.all(`
      SELECT *
      FROM user_activity
    `)
      .then(res => {
        const userIds = res.map(row => row.user_id);
        const membersWithoutLogs = message.guild.members.filter(member => {
          return !member.user.bot && !userIds.includes(member.id);
        });

        const usersInactiveLogged = res.filter(row => {
          const daysSince = currentMoment.diff(row.last_active, 'days');
          // console.log(`${daysSince} days/${days} :: ${moment(row.last_active).format()} :: ${currentMoment.format()}`);
          return daysSince > days;
        });

        const usersInactive = usersInactiveLogged.length + membersWithoutLogs.size;
        // console.log(`INACTIVE USERS: `, usersInactive);

        if(usersInactive === 0) {
          message.channel.send(`No inactive users found. (Last ${days} days)`);
          return;
        }
        if(usersInactiveLogged.length > 0) {

          const usersInactiveLoggedIds = usersInactiveLogged.map(user => {
            return user.user_id;
          });

          const inactiveMembers = message.guild.members.filter(member => {
            return !member.user.bot && usersInactiveLoggedIds.includes(member.id);
          });

          const addField = (embed, inactiveMember) => {
            const lastSeenTimestamp = usersInactiveLogged.find(user => user.user_id === inactiveMember.user.id).last_active;
            const lastSeenDate = moment(lastSeenTimestamp);
            // const lastSeenFormatted = lastSeenDate.tz('Asia/Tokyo').format('MM-DD');
            const daysSince = currentMoment.diff(lastSeenDate, 'days');
            embed.addField(`${inactiveMember.user.username}#${inactiveMember.user.discriminator}`, `${daysSince} days ago`, true);
          };

          const embedArgs = {
            createEmbed: () => new Discord.RichEmbed().setColor(Constants.mustardColorCode).setTitle(`Inactive Users cont'd`),
            firstEmbed: embed => embed.setTitle(`Inactive Users`).setDescription(`Users who have been inactive for at least ${days} days.`),
            lastEmbed: embed => embed.setFooter(`Total ${inactiveMembers.size} users`)
          };

          DiscordUtils.sendEmbeds(message, Array.from(inactiveMembers.values()), addField, embedArgs)
            .catch(console.error);
        }
        if(membersWithoutLogs.size > 0) {

          const membersWithoutLogsFormatted = membersWithoutLogs.map(member => {
            return '``' + `${member.user.username}#${member.user.discriminator}` + '``'
          })
            .join(' ');

          const embed = new Discord.RichEmbed()
            .setColor(Constants.mustardColorCode)
            .setTitle(`Users with no logged activity`)
            .setDescription(`The following users have not participated since this database was created: ${membersWithoutLogsFormatted}`)
            .setFooter(`Total ${membersWithoutLogs.size} users`);

          message.channel.send(``, embed);

        }


      })
      .catch(console.error)
  }
}