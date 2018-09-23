const Jimp = require('jimp');

module.exports = {
  name: 'ssg',
  description: 'creates a meme image from template and posts it to channel',
  execute: async function(message, args) {
    const name = args.shift();
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