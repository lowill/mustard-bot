require('module-alias/register');

const { prefix } = require('@config/config.json');
const assert = require('assert');
const setPresence = require('@commands/set-presence.js');

describe('set-presence module', () => {
  const fakeDiscordMessage = {
    content: `${prefix}${setPresence.name} hello world!`
  };
  const fakeResources = {
    DiscordClient: {
      user: {
        setPresence(presenceData) {
          return new Promise((resolve, reject) => {
            resolve({
              presence: presenceData.game.name,
              status: presenceData.status
            });
          });
        }
      }
    }
  }

  describe('execute method', () => {
    it('should return the fake presence string after executing via the fake client', async () => {
      const actual = await setPresence.execute(fakeDiscordMessage, '', fakeResources);
      assert.equal(actual.presence, 'hello world!');
    });

    // currently always has "online" status
    it('should return online status after executing via the fake client', async () => {
      const actual = await setPresence.execute(fakeDiscordMessage, '', fakeResources);
      assert.equal(actual.status, 'online');
    });
  });
});