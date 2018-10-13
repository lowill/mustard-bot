require('module-alias/register');

const assert = require('chai').assert;
const { prefix } = require('@config/config.json');
const Tavi = require('@commands/tavi.js');

describe('tavi module', () => {
  const fakeDiscordMessage = {
    channel: {
      send(str) {
        return str;
      }
    }
  };

  describe('execute method', () => {
    it('should return the expected twitch.tv url via the fake Discord client', () => {
      const actual = Tavi.execute(fakeDiscordMessage);
      assert.strictEqual(actual, `https://clips.twitch.tv/RelentlessSleepyTruffleHoneyBadger`);
    });
  });
});