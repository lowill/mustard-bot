require('module-alias/register');

const assert = require('assert');

const { prefix } = require('@config/config.json');
const Say = require('@commands/say.js');

describe('Say module', function() {
  const fakeResources = {
    DiscordClient: {
      channels: new Map().set('361474135513235457', {
        send(message) {
          return message;
        }
      })
    }
  };
  const fakeMessage = { content: `${prefix}${Say.name} hello world!` };
  
  describe('execute method', function() {
    it('should send a message via the fake client without the first four characters', function() {
      const actual = Say.execute(fakeMessage, [], fakeResources);
      assert.equal(actual, 'hello world!');
    });    
  });
});