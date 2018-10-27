const Discord = require('discord.js');
const Permissions = require('@config/Permissions.json');
const Constants = require('@constants/Constants.js');
const BotUtils = require('./BotUtils.js');
const Utils = require('./Utils.js');

// Group functions in this file into a single object curried with the Discord Client
function DiscordUtils(discordClient) {

  return {
    chatFactory(channelId) {
      return (message, options) => discordClient.channels.get(channelId).send(message, options);
    },

    // TODO: Filter by guild/server so we are generally always getting the right emoji
    getEmoji(emojiName) {
      return `<:${emojiName}:${discordClient.emojis.find(item => item['name'] === emojiName).id}>`;
    },

    // used to determine if the user has permission to use the command
    hasPermission(user, guild, command) {
      // trivial case, no permissions set
      if(command.permissions === undefined || command.permissions === null) return true;

      const permissionRequired = BotUtils.getPermissionLevel(command.permissions);
      const permittedRoles = Permissions.filter(role => role.permissionLevel <= permissionRequired);

      let hasPermission = false;
      // If guild is null, we can assign null to this value
      const userRoles = guild !== null ? guild.members.get(user.id).roles : null;
      // PermittedRoles has an array of roleIds
      for(let role of permittedRoles) {
        if(guild !== null && role.roleIds !== undefined) {
          for(let id of role.roleIds) {
            if(userRoles !== undefined && userRoles.has(id)) {
              hasPermission = true;
              break;
            }
          }
        }
        // Owner case
        else if(role.userId !== undefined && user.id === role.userId) {
          hasPermission = true;
        }
        if(hasPermission) break;
      }

      return hasPermission;
    },

    // used to get the highest permission level a user has access
    getHighestPermissionForUser(user) {
      for(let permissionItem of Permissions) {
        if(permissionItem.roleIds !== undefined) {
          for(let roleId of permissionItem.roleIds) {
            if(user.roles !== undefined && user.roles.has(roleId)) {
              return permissionItem.permissionLevel;
            }
          }
        }
        else if(permissionItem.userId === user.id) {
          return permissionItem.permissionLevel;
        }
      }
    },

    // This method should only be used with numeric permissions
    getEligiblePermissions(permissionLevel) {
      const eligiblePermissions = ['everyone'];
      for(let permissionItem of Permissions) {
        if(permissionItem.permissionLevel >= permissionLevel) {
          eligiblePermissions.push(permissionItem.name);
        }
      }
      return eligiblePermissions;
    },

    // TODO: Finish implementing
    // Resolve users in different ways. @mentions, IDs, and UName/Discriminator
    resolveUser(identifier) {
      let result = null;

      const idMatch = identifier.match(/^\d+$/);
      if(idMatch !== null) {
        result = discordClient.fetchUser(identifier);
      }
    },

    // You can add a max of 25 fields to an embed.
    // This method will break your data out into sets of 25 to send multiple embeds
    sendEmbeds(message, data, addField, args) {
      const {
        createEmbed,
        firstEmbed,
        lastEmbed
      } = args;

      const dataChunks = Utils.arrayDivide(data, 25);

      const messagePromises = [];

      const embedGenerator = (function* () {
        const newEmbed = () => typeof createEmbed === 'function' ? createEmbed() : new Discord.RichEmbed();
        let embed = newEmbed();
        yield typeof firstEmbed === 'function' ? firstEmbed(embed) : embed;

        const dataChunkIterator = dataChunks[Symbol.iterator]();
        let chunk;
        do {
          chunk = dataChunkIterator.next();
          embed = newEmbed();
          yield typeof lastEmbed === 'function' ? lastEmbed(embed) : embed;
        } while( chunk.done === false );
      }(dataChunks));

      dataChunks.forEach(chunk => {
        const embed = embedGenerator.next().value;
        chunk.forEach(datum => addField(embed, datum));
        messagePromises.push(message.channel.send(``, embed));
      });

      return Promise.all(messagePromises);
    },

    // There is a 2000 character limit for sending messages on Discord
    sendLongMessage(sourceMessage, messageToSend) {
      const messageChunks = Utils.stringDivide(messageToSend, Constants.messageCharacterLimit);
      return Promise.all(messageChunks.map(chunk => sourceMessage.channel.send(chunk)));
    }

  }
};

module.exports = DiscordUtils;