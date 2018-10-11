// Creates a deep clone of an object https://stackoverflow.com/a/5344074
function objectDeepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports.objectDeepClone = objectDeepClone;