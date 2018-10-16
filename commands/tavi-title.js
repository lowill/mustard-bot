/**
 *  This module was written such that it could be adapted for generic use.
 *  If desired, rename it and allow it to dynamically reference the db
 **/
const { prefix } = require('@config/config.json');
const Utils = require('@utils/Utils.js');
// const DBUtils = require('@commands/DBUtils');

// Track a list of tables that have been initialized so we only need to run that query once per bot instance
const existingTables = [];

function initTable(db, name) {
  if(name === undefined || typeof name !== 'string' || !name.match(/^\w+$/))
    throw new TypeError('name must be a word string');

  return db.run(`
    CREATE TABLE
    IF NOT EXISTS title_${name}
    (
      title TEXT NOT NULL,
      affix TEXT NOT NULL,
      author_id TEXT,
      time_added INTEGER
    )
  `, {

  })
    .then(res => {
      existingTables.push(name);
      return res;
    });

}

function getTitle(db, name) {
  if(name === undefined || typeof name !== 'string' || !name.match(/^\w+$/)) 
    throw new TypeError('name must be a word string');
  return db.all(`
    SELECT title, affix
    FROM title_${name}
  `);
}

function addTitle(db, name, title, affix, author_id, time_added) {
  if(name === undefined || typeof name !== 'string' || !name.match(/^\w+$/)) throw new TypeError('name must be a word string');
  if(title === undefined || typeof title !== 'string') throw new TypeError('title must be a string');
  if(affix !== 'prefix' && affix !== 'suffix') throw new Error('affix must be either "prefix" or "suffix"');

  return db.run(`
    INSERT
    INTO title_${name} (
      title,
      affix,
      author_id,
      time_added
    )
    VALUES (
      $title,
      $affix,
      $author_id,
      $time_added
    )
  `, {
    $title: title,
    $affix: affix,
    $author_id: author_id,
    $time_added: time_added
  });
}

function constructTitle(name, titles) {
  const prefixes = titles.filter(item => item.affix === 'prefix').map(item => item.title);
  const suffixes = titles.filter(item => item.affix === 'suffix').map(item => item.title);
  return `${prefixes.join(' ')} ${name} ${suffixes.join(' ')}`;
}

const commandName = 'tavi-title'
module.exports = {
  name: commandName,
  description: `Prints the Tavi title. You may specify options for appending to the title.  Usage: \`\`${prefix}${commandName} [options] [title]\`\` Options: \`\`-p, --prefix, -s, --suffix\`\` Example: \`\`${prefix}${commandName} --prefix Hero\`\``,
  async execute(message, args, resources) {

    // const name = args.shift(); // for generic usage
    const name = `Tavi`;
    if(!name.match(/\w+/)) throw new Error('That name cannot be used, please only submit letters and numbers.');
    const nameLower = name.toLowerCase();

    // only run the init function if 
    if(!existingTables.includes(nameLower)) {
      await initTable(resources.DB, name)
        .then(() => {
          // console.log(`successfully initialized table ${nameLower}`)
          existingTables.push(nameLower);
        })
        .catch(console.error);
    }

    const parsedArgs = require('minimist')(args);
    const prefix = parsedArgs.prefix || parsedArgs.p;
    const suffix = parsedArgs.suffix || parsedArgs.s;

    // only allow one
    if(Utils.logicalXOR(prefix, suffix) === false) throw new Error('You cannot set both a prefix and a suffix.');
    // defaults to suffix if neither was passed
    const affix = prefix ? 'prefix' : 'suffix';

    const newTitle = args.filter(arg => !arg.startsWith('-')).join(' ');

    return new Promise((resolve, reject) => {
      if(newTitle.length > 0) {
        addTitle(resources.DB, nameLower, newTitle, affix, message.author.id, message.createdTimestamp)
          .then(resolve, reject)
          .catch(console.error);
      }
      else {
        resolve();
      }
    })
    .then(res => {
      return getTitle(resources.DB, nameLower);
    })
    .then(res => {
      const title = constructTitle(name, res);
      return message.channel.send(title);
    })
    .catch(console.error);
  }
}

module.exports.test = {};
module.exports.test.initTable = initTable;
module.exports.test.getTitle = getTitle;
module.exports.test.addTitle = addTitle;
module.exports.test.constructTitle = constructTitle;