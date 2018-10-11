const assert = require('assert');
const Ssg = require('@commands/ssg.js');

const { prefix } = require('@config/config.json');

describe('ssg module', () => {
  describe('execute method', () => {
    let printCounter = 0;
    let bufferCounter = 0;
    const fakeImage = {
      print: (font, x, y, opts, xmax, ymax) => ++printCounter,
      getBufferAsync: (mime) => Promise.resolve(++bufferCounter)
    };

    const fakeJimp = {
      read: (imageFile) => Promise.resolve(fakeImage),
      loadFont: (fontFile) => Promise.resolve(fontFile)
    };

    const fakeMessage = {
      content: `${prefix}${Ssg.name} `,
      channel: {
        send(message, attachments) {
          return Promise.resolve({message, attachments});
        }
      }
    };

    it(`should successfully post the image to the channel`, async () => {
      const fakeMessagePassing = Object.assign({}, fakeMessage);
      fakeMessagePassing.content += 'test';
      let resolved = false;
      await Ssg.execute(fakeMessagePassing, null, { Jimp: fakeJimp })
        .then(resolution => resolved = true, err => console.error(err))
        .catch(console.error);
      assert.equal(resolved, true);
    });

    it('should throw an error if the name was empty or undefined', async () => {
      let threwError = false;
      await Ssg.execute(fakeMessage, null, { Jimp: fakeJimp })
        .catch(err => {threwError = true});

      assert.equal(threwError, true);
    });

  });
});