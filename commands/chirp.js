module.exports = {
  name: 'chirp',
  description: 'fetches a tweet (with media) and posts any extra images that Discord did not embed.',
  execute(message, args, resources) {
    const url = args.shift();
    if(!url.match(/http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/)) {
      console.error(`Failed to validate Tweet with url:${url}`);
      message.channel.send(`Are you sure that was a valid Twitter URL?  I couldn't read it.`);
    }
    else if(!('TwitterClient' in resources)) {
      console.error(`TwitterClient not initialized.`);
      message.channel.send(`Something went wrong, sorry.`);
    }
    else {
      const id = url.split('/').pop();
      resources.TwitterClient.get(`statuses/show`, {id: id})
        .then(res => {
          if('extended_entities' in res) {
            if('media' in res.extended_entities) {
              const media = res.extended_entities.media;
              const mediaUrls = media.map(item => item.media_url);
              if(mediaUrls.length > 1) {
                message.channel.send(`Remaining Images:`, {
                  files: mediaUrls.slice(1)
                });                
              }
              else {
                message.channel.send(`No remaining images.`);
              }
            }
            else {
              console.log('No media attribute in extended entities', res.extended_entities);
            }
          }
          else {
            console.log('No extended entities');
            message.channel.send(`Sorry, I couldn't find images on this tweet for some reason...`);
          }
        })
        .catch(err => {
          console.error(err);
          message.channel.send(`Something went wrong, sorry.`);
        });
    }
  }
}