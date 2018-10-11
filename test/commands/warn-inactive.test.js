require('module-alias/register');

const { prefix } = require('@config/config.json');

const assert = require('assert');
const Discord = require('discord.js');
const WarnInactive = require('@commands/warn-inactive.js');

const Utils = require('@utils/Utils.js');

describe('warn-inactive module', () => {

  const fakeChannel = {
    send(message, attachments) {
      return new Promise((resolve, reject) => {
        resolve({
          message: message,
          attachments: attachments
        });
      });
    }
  };

  const fakeMessage = {
    channel: fakeChannel, 
    guild: {
      members: new Discord.Collection().set('9999999999999999', {
        user: {
          username: 'USER',
          discriminator: '9999'
        },
        createDM: function() {
          return new Promise((resolve, reject) => {
            resolve(fakeChannel);
          });
        }
      })
    }
  };

  const fakeResources = {
    DiscordClient: {
      channels: new Discord.Collection().set('fakeDMChannel', Object.assign({
        id: 8888888888888888
      }, fakeChannel))
    }
  };

  describe('execute method', () => {
    it(`should create a DM channel if none existed and send a RichEmbed`, async () => {
      const fakeArgs = ['USER#9999'];
      const actual = await WarnInactive.execute(fakeMessage, fakeArgs, fakeResources);
      assert.equal(actual.message instanceof Discord.RichEmbed, true);
    });

    it(`should find an existing DM channel and send a RichEmbed`, async () => {
      // Temporarily add the channel value
      fakeMessage.guild.members.get('9999999999999999').dmChannel = 8888888888888888;

      const fakeArgs = ['USER#9999'];
      const actual = await WarnInactive.execute(fakeMessage, fakeArgs, fakeResources);
      assert.equal(actual.message instanceof Discord.RichEmbed, true);

      // remove temporary value
      delete fakeMessage.guild.members.dmChannel;
    });

    it('should throw an error if no target user was provided', () => {
      const fakeArgs = [];
      assert.throws(() => {WarnInactive.execute(fakeMessage, fakeArgs, fakeResources)}, {name: 'Error'});
    });

    it(`should throw an error if the target user was poorly formatted`, () => {
      const fakeArgs = ['USER#999'];
      assert.throws(() => {WarnInactive.execute(fakeMessage, fakeArgs, fakeResources)}, {name: 'Error'});
    });

    it(`should fail if the target ID wasn't found`, () => {
      const fakeArgs = ['USER#0000'];
      assert.throws(() => {WarnInactive.execute(fakeMessage, fakeArgs, fakeResources)}, {name: 'Error'});
    });
  });
});