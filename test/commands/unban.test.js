require('module-alias/register');

const assert = require('chai').assert;
const Unban = require('@commands/unban.js');

describe('unban module', () => {
  const fakeDiscordMessage = {
    guild: {
      fetchBans() {
        return new Promise((resolve, reject) => {
          resolve(new Map().set('9999999999999999', {}));
        });
      },
      unban(id) {

        return new Promise(async (resolve, reject) => {
          const bans = await this.fetchBans();
          if(bans.has(id)) {
            resolve(true);
          }
          else {
            reject({name: 'Error', message: 'user not found'});
          }
        });

      }
    }
  }

  describe('execute method', () => {
    it('should return true if the user was banned', async () => {
      const actual = await Unban.execute(fakeDiscordMessage, ['9999999999999999']);
      assert.strictEqual(actual, true);
    });

    // Couldn't get this to work with assert.rejects.  Instead just getting a boolean value and doing the assertion outside async
    // This case also catches any users that exist but aren't banned
    it(`should throw an error if the user wasn't found`, async () => {
      let rejected = null;
      await Unban.execute(fakeDiscordMessage, ['1'])
        .then(res => {
          rejected = false;
        }, err => {
          rejected = true;
        })
        .catch(() => {rejected = false});
      assert.strictEqual(rejected, true);
    });

  });
});