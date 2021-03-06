const Discord = require('discord.js');
const fs = require('fs');
const { prefix } = require('@config/config.json');


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
    .setFooter(`This is an automated message.  This channel is not monitored.  Please do not reply to this bot.`)
)
.catch(console.error);

module.exports = {
  name: 'warn-inactive',
  description: `This command will send a prewritten message to a user about their inactivity. You must include their full username. Usage: \`\`${prefix}warn-inactive KrazyMustard#8015\`\``,
  permissions: 'admin',
  execute(message, args, resources) {
    let target = args[0];
    if(target != null) {
      resources.DiscordUtils.resolveUser(target)
        .then(user => {
          if(user) {
            console.log(user);
            if(!user.dmChannel) {
              return user.createDM()
                .then(channel => {
                  return channel.send(inactivityEmbed)
                    .then(() => message.react('✔'));
                })
                .catch(console.error);
            }
            else {
              const channelId = user.dmChannel;
              return resources.DiscordClient.channels.find(channel => channel.id === channelId).send(inactivityEmbed)
                .then(() => message.react('✔'))
                .catch(console.error);
            }
          }
          else {
            throw new Error(`Couldn't find that user.`);
          }
        });
    }
    else {
      throw new Error(`Are you sure that was a valid username? Please include their tag (#1234) as well.`);
    }
  }
};