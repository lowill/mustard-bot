const Discord = require('discord.js');
const fs = require('fs');
const { guildRoles, ownerId } = require('../config.json');

const adminRoleId = guildRoles.find(role => role.name === 'Captains').roleId;

let inactivityEmbed;

new Promise((resolve, reject) => {
  fs.readFile('./messages/inactivity-warning.txt', 'utf8', function(err, data) {
    if(err) {
      reject(err);
    }
    else {
      resolve(data);
    }
  });
})
.then(text =>
  inactivityEmbed = new Discord.RichEmbed()
    .setAuthor(`S.A.L.T. and Pepper Administrators`)
    .setColor(0xee1133)
    .setTitle('Inactivity Warning')
    .setDescription(text)
    .setFooter(`This is an automated message.  Please do not reply.`)
)
.catch(err => console.error);


module.exports = {
  name: 'warn-inactive',
  description: `Moderator use only.  This command will send a prewritten message to a user about their inactivity. You must include their full username. Usage: "~warn-inactive KrazyMustard#8015"`,
  execute(message, args, resources) {
    // Admins or owner only.
    if(!(message.member.roles.has(adminRoleId) || message.author.id === ownerId)) return;

    let target = args.slice()[0];
    if(!target) return;
    // get the "discriminator" if included
    const match = target.match(/(.+)(#\d{4}$)/);
    if(match !== null) {
      const username = match[1];
      const discriminator = match[2].substring(1);
      const user = message.guild.members.find(member => member.user.username === username && member.user.discriminator === discriminator);

      if(user) {
        if(!user.dmChannel) {
          user.createDM()
            .then(channel => {
              channel.send(inactivityEmbed);
            })
            .catch(err => console.error);
        }
        else {
          const channelId = user.dmChannel;
          resources.DiscordClient.channels.find(channel => channel.id === channelId)
            .then(channel => {
              channel.send(inactivityEmbed);
            })
            .catch(err => console.error);
        }
      }
    }
    else {
      message.channel.send(`Are you sure that was a valid username? Please include their tag (#1234) as well.`);
    }
  }
};

function sendDM(user, message) {
  user.send(message);
}