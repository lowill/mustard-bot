const Joi = require('joi');
const moment = require('moment-timezone');
const schedule = require('node-schedule-tz');
const fs = require('fs');

// Unfortunately the module doesn't seem to implement the convenience scheduling like it says in its README
// Therefore I have added a function for converting a recurrence rule to a cron friendly string.
function recurrenceRuleToCronFormat(rule) {
  const { second='0', minute='*', hour='*', date='*', month='*', dayOfWeek='*' } = rule;
  let cronStr = '';
  [second, minute, hour, date, month, dayOfWeek].forEach(cronEl => cronStr += cronEl + ' ');
  return cronStr.trim();
}

// validates job objects
function isValidJob(job) {
  const schema = Joi.object().keys({
    name: Joi.string(),
    recurrenceRule: {
      year: Joi.number().integer(),
      month: Joi.number().integer(),
      date: Joi.number().integer(),
      hour: Joi.number().integer(),
      minute: Joi.number().integer(),
      second: Joi.number().integer(),
      dayOfWeek: Joi.number().integer(),
      tz: Joi.string().required()
    },
    type: Joi.any().valid(['chat']),
    data: Joi.object(),
    jobFunction: Joi.func()
  });

  return Joi.validate(job, schema)
    .then(res => true)
    .catch(err => false);
}

// Search the recurring-jobs directory for jobs
function getRecurringJobs(path='./jobs/recurring-jobs') {
  const jobs = [];
  const jobFiles = fs.readdirSync(path).filter(file => file.endsWith('.js'));
  for(const file of jobFiles) {
    // XXX dirty hack because require and readdirSync don't see paths the same way... need to fix this
    path = path.split('/').filter(a => a !== 'jobs').join('/');
    const job = require(`${path}/${file}`);
    if(isValidJob(job)) jobs.push(job);
    else console.error(`Failed to queue recurring job from ${path}/${file}.`);
  }
  return jobs;
}

module.exports.recurrenceRuleToCronFormat = recurrenceRuleToCronFormat;
module.exports.getRecurringJobs = getRecurringJobs;