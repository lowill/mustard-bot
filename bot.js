// deps
const Discord = require('discord.js');
const schedule = require('node-schedule-tz');
const fs = require('fs');
const Twitter = require('twitter');
const moment = require('moment-timezone');

const RecurringJobs = require('./jobs/RecurringJobs.js');

const { token, prefix, twitter_keys } = require('./config.json');
const channels = require('./channels.json').channels;


// initialize our client
const client = new Discord.Client();
const ClientUtils = require('./utils/ClientUtils.js')(client);
client.commands = new Discord.Collection();

// cmd args
const argv = require('minimist')(process.argv.slice(2));
const testMode = argv['test'] ? true : false;

// this object makes our connection resources available across the app 
const resources = {
  DiscordClient: client
};

// Event handling
// Startup tasks
client.on('ready', () => {
  console.log('Client is ready.');

  // start recurring jobs
  const chatFunctions = {};
  const scheduledJobs = [];

  const recurringJobs = RecurringJobs.getRecurringJobs();
  const chatJobs = recurringJobs.filter(job => job.type === 'chat');

  chatJobs.forEach(job => {
    // Safety method for testing.  If any jobs try to chat, they will only have access to the bot test channel
    const channelKey = testMode ? 'test' : job.data.channelKey;
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

  console.log('Completed initialization tasks.');

  // create Twitter client
  const TwitterClient = new Twitter({
    consumer_key: twitter_keys.consumer_key,
    consumer_secret: twitter_keys.consumer_secret,
    bearer_token: twitter_keys.bearer_token
  });
  resources.TwitterClient = TwitterClient;

  return;
 
  function createChatFunctionFromKey(key) {
    const channelId = channels[key].channelId;
    const chatFn = ClientUtils.chatFactory(channelId);
    return chatFn;
  }
});

client.on('message', message => {
  // Ignore messages not relevant to this bot
  // TODO: Refactor to allow comparing messages against self later, for testing purposes.
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // make commands easier to digest
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  // Ignore any commands that don't exist
  if(!client.commands.has(command)) return;

  // Safe command execution
  try {
    client.commands.get(command).execute(message, args, resources);
  }
  catch(error) {
    console.error(error);
    message.reply('Sorry, something went wrong.');
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


// bot commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


client.login(token);