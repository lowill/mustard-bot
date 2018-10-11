const { prefix } = require('@config/config.json');

module.exports = {
  name: 'ssg',
  description: `Creates a meme image from the sasuga template and posts it to channel. Usage: \`\`${prefix}ssg [name]\`\``,
  execute: async function(message, args, { Jimp }) {

    // We don't use args so people can use any string with whitespace
    // prefix + space + 'ssg'
    let name = message.content.substring(prefix.length + 4);
    if(name === undefined || name === '') throw new Error(`You forgot to type a name.  Try to keep it short.`);

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

    const buffer = await image
      .getBufferAsync(Jimp.MIME_PNG)
      .catch(console.error);

    return message.channel.send('', {
      files: [{
        attachment: buffer,
        name: 'ssg.png'
      }]
    });
  }
};