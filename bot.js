// activate module aliases
require('module-alias/register');
// deps
const Discord = require('discord.js');
const schedule = require('node-schedule-tz');
const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment-timezone');
const Jimp = require('jimp');

const RecurringJobs = require('@jobs/RecurringJobs.js');

const Constants = require('@constants/Constants.js');
const Config = require('@config/config.json');
const channels = require('@config/channels.json').channels;
const Permissions = require('@config/Permissions.json');

// initialize our client
const client = new Discord.Client();
const DiscordUtils = require('@utils/DiscordUtils.js')(client);
client.commands = new Discord.Collection();

const DBUtils = require('@utils/DBUtils.js');
const DB = new DBUtils.Connection(Config.db_filename);

// cmd args
const argv = require('minimist')(process.argv.slice(2));
const testMode = argv['test'] ? true : false;

// this object makes our connection resources available across the app 
const resources = {
  DiscordClient: client,
  Jimp: Jimp,
  DB: DB
};

// initialize commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// get direct attachables - single commands that simply post a file to the channel
// files should have an extension
const attachmentDir = './commands-direct-attachments';
const memeFiles = fs.readdirSync(attachmentDir).filter(file => file.includes('.'));
for(const file of memeFiles) {
  const fileName = file.match(/([\w\s-,]+)\.([a-zA-Z0-9]+)/);
  if(fileName !== null) {
    const name = fileName[1];
    const extension = fileName[2];
    const command = {
      name: name,
      description: `Posts a file called ${file}.`,
      type: 'direct-attachment',
      execute(message, args) {
        message.channel.send('', {
          files: [{
            attachment: `${attachmentDir}/${file}`,
            name: file
          }]
        });
      }
    }
    client.commands.set(command.name, command);
  }
}

const helpEmbeds = {
  "everyone": new Discord.RichEmbed()
    .setColor(Constants.mustardColorCode)
    .setTitle(`Commands for Mustard Bot`)
    .setDescription(`The prefix for this bot is: ${Config.prefix}`)
};

Permissions.forEach(permissionItem => {
  helpEmbeds[permissionItem.name] = new Discord.RichEmbed()
    .setColor(Constants.mustardColorCode)
    .setTitle(`Commands for ${permissionItem.name}`)
    .setDescription(`These commands are restricted to the ${permissionItem.name} level.`);
});

const directAttachmentNames = client.commands
  .filter(command => command.type === 'direct-attachment')
  .map(command => command.name)
  .map(commandName => `\`\`${commandName}\`\``)
  .join(', ');

helpEmbeds['everyone']
  .addField(`Image Attachments (Memes)`, directAttachmentNames);

client.commands.filter(command => command.type !== 'direct-attachment')
  .forEach(command => {
    const permission = command.permissions !== undefined 
      ? command.permissions 
      : 'everyone';
    helpEmbeds[permission]
      .addField(command.name, command.description);
  });

const helpCommand = {
  name: 'help',
  description: 'Posts a list of commands.',
  execute(message, args) {
    const authorPermission = DiscordUtils.getHighestPermissionForUser(message.author);
    const eligiblePermissions = DiscordUtils.getEligiblePermissions(authorPermission);

    if(eligiblePermissions !== undefined) {
      eligiblePermissions.forEach(level => {
        if(helpEmbeds[level].fields.length > 0) {
          if(level === 'everyone') {
            message.channel.send('', helpEmbeds[level]);
          }
          else if(message.channel.id === Config.adminChannelId) {
            message.channel.send('', helpEmbeds[level]);
          }
        }
      });
    }
    else {
      message.channel.send('', helpEmbeds['everyone']);
    }
  }
};
client.commands.set(helpCommand.name, helpCommand);

// TEST
client.commands.set(`salt`, {
  name: 'salt',
  description: '',
  execute(message, args) {
    try {
      console.log(args);
      // client.commands.get('get-inactive').execute(message, ['3'], resources);
      DB.all(`
        SELECT *
        FROM user_activity
      `).then(res => {
          const userIds = res.map(row => row.user_id);
          const users = message.guild.members.map(member => {
            if(userIds.includes(member.user.id)) {
              return {
                id: member.user.id,
                username: member.user.username,
                last_active: moment(res.find(item => item.user_id === member.user.id).last_active).format()
              }
            }
            else return null;
          }).filter(item => item !== null);
          // console.log(users);

        })
        .catch(console.error);

    }
    catch(err) {
      console.error(err);
    }
    finally {
      if(!testMode) message.delete();
    }
  }
})
// END TEST

// Event handling
// Startup tasks
client.isReady = false;
client.on('ready', () => {
  console.log('Client is ready.');

  // Write a channels list to disk, for developer convenience
  writeChannelsList(client);
  // Write a roles list to disk, for developer convenience
  writeRolesList(client);

  // start recurring jobs
  const chatFunctions = {};
  const scheduledJobs = [];

  const recurringJobs = RecurringJobs.getRecurringJobs();
  const chatJobs = recurringJobs.filter(job => job.type === 'chat');

  chatJobs.forEach(job => {
    // Safety method for testing.  If any jobs try to chat, they will only have access to the bot test channel
    const channelKey = testMode ? 'test' : job.data.channelKey;
    // initialize chat functions, don't want to create chat functions all over the place
    if(!(channelKey in chatFunctions)) {
      chatFunctions[channelKey] = createChatFunctionFromKey(channelKey);
    }

    const execJob = () => 
      job.jobFunction(chatFunctions[channelKey])
        .catch(err => console.error(err));

    // XXX Workaround because timezones DO NOT WORK with the convenience method in node-schedule-tz.
    const cronFormat = RecurringJobs.recurrenceRuleToCronFormat(job.recurrenceRule);

    const scheduledJob = schedule.scheduleJob(job.name, job.recurrenceRule, job.recurrenceRule.tz, execJob);
    scheduledJobs.push(scheduledJob);
  });

  scheduledJobs.forEach(job => {
    setInterval(() => {
      const nextInvocation = job.nextInvocation();
      console.log(`Next scheduled invocation for job ${job.name}: ${moment(nextInvocation).format('h:mma zZ')}`);
    }, 1000 * 60 * 60);
  });

  // create Twitter client
  const TwitterClient = new Twitter({
    consumer_key: Config.twitter_keys.consumer_key,
    consumer_secret: Config.twitter_keys.consumer_secret,
    bearer_token: Config.twitter_keys.bearer_token
  });
  resources.TwitterClient = TwitterClient;

  // Setup user activity table
  DB.run(`
    CREATE TABLE 
    IF NOT EXISTS user_activity 
    (
      user_id TEXT PRIMARY KEY,
      last_active INTEGER
    )
  `)
    .then(() => {
      return DB.all(`SELECT * FROM user_activity`);
    })
    .catch(console.error);

  // Set the status text
  client.user.setPresence({ game: { name: `Say ~help for commands list` }, status: 'online' })
    .catch(console.error);

  console.log(`${moment().format(Constants.loggingFormat)} Completed initialization tasks`);
  client.isReady = true;
});

client.on('message', message => {
  // Disallow any commands until our initialization tasks are completed.
  if(client.isReady !== true) return;

  // Store the last timestamp each user sent a message to determine inactivity (get-inactive command)
  if(message.author.bot === false) {
    const timestamp = message.createdTimestamp;
    DB.run(`
      INSERT OR REPLACE
      INTO user_activity (
        user_id,
        last_active
      )
      VALUES (
        $id,
        $last_active
      )
    `, {
      $id: message.author.id,
      $last_active: timestamp 
    })
      .catch(console.error);
  }

  // Ignore messages not relevant to this bot
  // TODO: Refactor to allow comparing messages against self later, for testing purposes.
  if (!message.content.startsWith(Config.prefix) || message.author.bot) return;

  // make commands easier to digest
  const args = message.content.slice(Config.prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // Ignore any commands that don't exist
  if(!client.commands.has(command)) {
    const emojiIds = ['372318649366740994', '370590162033442828', '385750068667482112'];
    const randomEmojiId = emojiIds[Math.floor(Math.random()*emojiIds.length)];
    const emoji = message.guild.emojis.get(randomEmojiId) || '🤔';
    message.react(emoji);
    return;
  }

  // Safe command execution
  try {
    const commandObj = client.commands.get(command);
    // Check that user has required permissions
    if(DiscordUtils.hasPermission(message.author, message.guild, commandObj)) {
      commandObj.execute(message, args, resources);
    }
    else {
      console.error(`${message.author.username} tried to use command without permission:`, message.content);
    }
  }
  catch(error) {
    console.error(error);
    message.reply(error.message);
  }
  finally {
    // just remove messages
    if(testMode === true) {
      message.delete();
    }
  }
});

client.on('disconnect', () => {
  console.log('Client has disconnected.');
});

client.on('reconnecting', () => {
  console.log('Client is attempting to reconnect.');
});

client.on('resume', () => {
  console.log('Client successfully reconnected.');
});

client.on('guildMemberAdd', member => {
  setTimeout(() => {
    const sayLobby = createChatFunctionFromKey('main');
    const greeting = `Welcome <@${member.user.id}> to this rowdy crew! Be sure to checkout <#361789980428992514> first and setup your profile to the server! Use the commands at <#361479929705136128>!`;
    sayLobby(greeting);
  }, 5000)
});

// utils
function createChatFunctionFromKey(key) {
  const channelId = channels[key].channelId;
  const chatFn = DiscordUtils.chatFactory(channelId);
  return chatFn;
}

// For your convenience this function simply creates a JSON file of all the channels to which your bot has access
function writeChannelsList(discordClient) {
  const channels = discordClient.guilds.map(guild => {
    const channelsList = guild.channels.map(channel => {
      return {
        name: channel.name,
        type: 'GUILD.CHANNEL',
        id: channel.id
      };
    });
    return {
      name: guild.name,
      type: 'GUILD',
      id: guild.id,
      channels: channelsList
    }
  });

  const writeStream = fs.createWriteStream('./AvailableChannels.json', 'utf8');
  writeStream.cork();
  writeStream.write(`//THIS IS AN AUTOMATICALLY GENERATED FILE.  YOUR CHANGES WILL BE OVERWRITTEN.\n`);
  writeStream.write(JSON.stringify(channels, null, 2));
  writeStream.uncork();
  writeStream.end();
}

// For your convenience this function simply creates a JSON file of all the roles to which your bot has access
function writeRolesList(discordClient) {
  const roles = discordClient.guilds.map(guild => {
    const rolesList = guild.roles.map(role => {
      return {
        name: role.name,
        type: 'GUILD.ROLE',
        id: role.id
      };
    });
    return {
      name: guild.name,
      type: 'GUILD',
      id: guild.id,
      roles: rolesList
    };
  });

  const writeStream = fs.createWriteStream('./AvailableRoles.json', 'utf8');
  writeStream.cork();
  writeStream.write(`//THIS IS AN AUTOMATICALLY GENERATED FILE.  YOUR CHANGES WILL BE OVERWRITTEN.\n`);
  writeStream.write(JSON.stringify(roles, null, 2));
  writeStream.uncork();
  writeStream.end();
}

client.login(Config.discordToken);