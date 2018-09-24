const Jimp = require('jimp');
const { prefix } = require('../config.json');

module.exports = {
  name: 'ssg',
  description: 'Creates a meme image from the sasuga template and posts it to channel.',
  execute: async function(message, args) {
    // prefix + space + 'ssg'
    let name = message.content.substring(prefix.length + 4);
    if(name === undefined || name === '') {
      message.channel.send(`You forgot to type a name.  Try to keep it short.`);
      return;
    }
    name = name.toUpperCase();

    const memeText = `SASUGA ${name}- SAMA!!!`;
    const memeText2 = `IMPREGNATE ME ${name}- SAMA!!!`;

    const ssgFont = await Jimp.loadFont('./fonts/Blokletters-Viltstift.fnt');
    const ssgFontSmall = await Jimp.loadFont('./fonts/Blokletters-Viltstift24px.fnt');
    const image = await Jimp.read('./images/ssg-template.jpg');

    image.print(
      ssgFont, 
      250, 
      20, 
      {
        text: memeText,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      80,
      150
    );

    image.print(
      ssgFontSmall, 
      480, 
      80, 
      {
        text: memeText2,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      120,
      140
    );

    image.getBufferAsync(Jimp.MIME_PNG)
      .then(imgBuffer => {
        message.channel.send('', {
          files: [{
            attachment: imgBuffer,
            name: 'ssg.png'
          }]
        });
      })
      .catch(err => console.error(err));
  }
};