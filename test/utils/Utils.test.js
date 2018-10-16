require('module-alias/register');
const Utils = require('@utils/Utils.js');
const ArrayDivide = Utils.arrayDivide;
const LogicalXOR = Utils.logicalXOR;
const assert = require('chai').assert;

describe('Utils module', () => {
  describe('arrayDivide method', () => {
    it('should divide a simple array in two', () => {
      const array = [0, 1, 2, 3, 4, 5];
      const arraySize = 3;

      const actual = ArrayDivide(array, arraySize);
      const expected = [[0, 1, 2], [3, 4, 5]];

      assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('should handle a more complicated case', () => {
      const array = [...Array(22).keys()];
      const arraySize = 4;

      const actual = ArrayDivide(array, arraySize);
      const expected = [[0, 1, 2, 3,], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], [16, 17, 18, 19], [20, 21]];

      assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('should handle array size of 1', () => {
      const array = [0, 1, 2, 3, 4];
      const arraySize = 1;

      const actual = ArrayDivide(array, arraySize);
      const expected = [[0], [1], [2], [3], [4]];

      assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('should always return a nested array, even if the input is smaller than the given size', () => {
      const array = [0, 1, 2, 3];
      const arraySize = 10;

      const actual = ArrayDivide(array, arraySize);
      const expected = [[0, 1, 2, 3]];

      assert.equal(JSON.stringify(actual), JSON.stringify(expected));
    });

    it('should throw an error if no array is passed', () => {
      assert.throws(() => ArrayDivide(undefined, 1));
    });

    it('should throw an error if a negative array size is passed', () => {
      assert.throws(() => ArrayDivide([], -1));
    });

    it('should throw an error if a nonNumber array size is passed', () => {
      assert.throws(() => ArrayDivide([], 'foo'));
    })
  });

  describe('logicalXOR method', () => {

    it('should return true if a is true and b is false', () => {
      const a = true;
      const b = false;

      const actual = LogicalXOR(a, b);
      const expected = true;

      assert.strictEqual(actual, expected);
    });

    it('should return true if a is false and b is true', () => {
      const a = false;
      const b = true;

      const actual = LogicalXOR(a, b);
      const expected = true;

      assert.strictEqual(actual, expected);
    });

    it('should return false if both a and b are true', () => {
      const a = true;
      const b = true;

      const actual = LogicalXOR(a, b);
      const expected = false;

      assert.strictEqual(actual, expected);
    });

    it('should return false if both a and b are false', () => {
      const a = false;
      const b = false;

      const actual = LogicalXOR(a, b);
      const expected = false;

      assert.strictEqual(actual, expected);
    });

  });
});