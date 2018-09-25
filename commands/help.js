const Discord = require('discord.js');
const fs = require('fs');
const { prefix, guildRoles, ownerId, adminChannelId } = require('../config.json');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const helpData = {};
const adminHelpData = {}; // commands reserved for admins
const ignoreList = ['help.js', 'set-presence.js', 'say.js', 'warn-inactive.js'];
const adminList = ['warn-inactive.js'];

const adminRoleId = guildRoles.find(role => role.name === 'Captains').roleId;

for(const file of commandFiles) {
  const command = require(`./${file}`);
  if(!ignoreList.includes(file)) {
    helpData[command.name] = {
      name: command.name,
      description: command.description
    };
  }
  else if(adminList.includes(file)) {
    adminHelpData[command.name] = {
      name: command.name,
      description: command.description
    };
  }
}

const helpEmbed = new Discord.RichEmbed({
  color: 0xffdb58,
  title: `Mustard-Bot Command List`,
  description: `My prefix is ${prefix}`
}).addBlankField(true);
// Add the commands and their descriptions here.
for(let helpItem in helpData) {
  helpEmbed.addField(helpData[helpItem].name, helpData[helpItem].description);
}

const adminHelpEmbed = new Discord.RichEmbed({
  color: 0xffdb58,
  title: `Admin Commands List`,
  description: `The following commands only work for captains.`
}).addBlankField(true);
for(let adminHelpItem in adminHelpData) {
  adminHelpEmbed.addField(adminHelpData[adminHelpItem].name, adminHelpData[adminHelpItem].description);
}


module.exports = {
  name: 'help',
  description: 'Provides a listing of commands and their uses.',
  execute(message, args) {
    message.channel.send(helpEmbed);

    // Admins only (or the owner)
    if(message.member.roles.find(role => role.id === adminRoleId) || message.author.id === ownerId) {
      // Admin channel only
      if(message.channel.id === adminChannelId) {
        message.channel.send(adminHelpEmbed);
      }
    }
  }
};