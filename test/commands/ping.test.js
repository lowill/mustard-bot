require('module-alias/register');

const assert = require('chai').assert;
const Ping = require('@commands/ping.js');

describe('Ping module', function() {
  const fakeMessage = {
    channel: {
      send(str) {
        return str;
      }
    }
  };

  describe('execute method', function() {
    it('should return "Pong!" via the fake client.', function() {
      const actual = Ping.execute(fakeMessage);
      assert.strictEqual(actual, 'Pong!');
    });
  });
});