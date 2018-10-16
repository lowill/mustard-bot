// Creates a deep clone of an object https://stackoverflow.com/a/5344074
function objectDeepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Break an array into chunks with a maximum size
function arrayDivide(arr, arrSize) {
  if(!Array.isArray(arr)) throw new TypeError('arr must be an Array');
  if(arrSize < 1 || !Number.isInteger(arrSize) || arrSize === undefined) throw new Error('arrSize must be a positive integer');

  if(arr.length < arrSize) return [arr];

  const result = [];
  let prevArr = arr;
  while(prevArr.length > 0) {
    const chunk = prevArr.slice(0, arrSize);
    result.push(chunk);
    prevArr = prevArr.slice(arrSize);
  }

  return result;
}

function stringDivide(str, strSize) {
  if(typeof str !== 'string') throw new TypeError('str must be a string');
  if(strSize < 1 || !Number.isInteger(strSize) || strSize === undefined) throw new Error('strSize must be a positive integer');

  const result = [];
  let substr = str;
  while(substr.length > 0) {
    const chunk = substr.substring(0, strSize);
    result.push(chunk);
    substr = substr.substring(strSize);
  }

  return result;
}

function logicalXOR(a, b) {
  return (a || b) && !(a && b);
}

module.exports.objectDeepClone = objectDeepClone;
module.exports.arrayDivide = arrayDivide;
module.exports.logicalXOR = logicalXOR;
module.exports.stringDivide = stringDivide;