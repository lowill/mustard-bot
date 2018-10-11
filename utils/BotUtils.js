const Permissions = require('@config/Permissions.json');

function getPermissionLevel(permissionStr) {
  if(typeof permissionStr === 'number') return permissionStr;
  if(typeof permissionStr === 'string' && permissionStr.match(/^\d+$/) !== null) return Number(permissionStr);

  const permissionObj = Permissions
    .find(permission => permission.name === permissionStr);

  let permissionLevel = null;
  if(permission !== undefined) {
    permissionLevel = permissionObj.permissionLevel
  }

  return permissionLevel;
}

module.exports.getPermissionLevel = getPermissionLevel;