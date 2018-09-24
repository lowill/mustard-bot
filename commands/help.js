const Discord = require('discord.js');
const fs = require('fs');
const { prefix } = require('../config.json');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const helpData = {};
for(const file of commandFiles) {
  const command = require(`./${file}`);
  if(file !== 'help.js') {
    helpData[command.name] = {
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

module.exports = {
  name: 'help',
  description: 'Provides a listing of commands and their uses.',
  execute(message, args) {
    message.channel.send(helpEmbed);
  }
};