require('module-alias/register');
const Time = require('@commands/time.js');
const assert = require('chai').assert;
const sinon = require('sinon');

const moment = require('moment-timezone');
const timeFormat = Time.test.timeFormat;

describe('time module', () => {
  describe('execute method', () => {
    const sendMessage = sinon.spy();
    const fakeMessage = {
      channel: {
        send: sendMessage
      }
    };

    afterEach(() => {
      sendMessage.resetHistory();
    });

    it(`should send a message containing the current time in Tokyo if no timezone was passed`, () => {
      Time.execute(fakeMessage, ['']);
      const actual = moment.tz(sendMessage.args[0], timeFormat, 'Asia/Tokyo');
      const expected = moment().tz('Asia/Tokyo');
      assert.strictEqual(momentsEqual(actual, expected), true);
    });
    it(`should send a message containing the current time in the specified timezone if one was passed`, () => {
      Time.execute(fakeMessage, ['America/Chicago']);
      const actual = moment.tz(sendMessage.args[0], timeFormat, 'America/Chicago');
      const expected = moment().tz('America/Chicago');
      assert.strictEqual(momentsEqual(actual, expected), true);
    });
    it(`should throw an error if an invalid timezone was passed`, () => {
      assert.throws(() => Time.execute(fakeMessage, ['PDT']));
    });

  });
});

// Test if moments are equal, accurate to the minute
function momentsEqual(time1, time2) {
  const moment1 = moment(time1);
  const moment2 = moment(time2);
  return moment1.minute() === moment2.minute()
    && moment1.hour() === moment2.hour()
    && moment1.date() === moment2.date()
    && moment1.day() === moment2.day()
    && moment1.month() === moment2.month()
    && moment1.year() === moment2.year();
}

describe('test method: momentsEqual', () => {
  it(`should return true if the moments are equal (accurate to the minute)`, () => {
    const testTime = moment();
    assert.strictEqual(momentsEqual(testTime, testTime), true);
  });

  const baseTime = `2018-10-02T10:55:00`;
  it(`should return false if the minute was different`, () => {
    const compareTime = `2018-10-02T10:50:00`;
    assert.strictEqual(momentsEqual(baseTime, compareTime), false);
  });

  it(`should return false if the hour was different`, () => {
    const compareTime = `2018-10-02T05:55:00`;
    assert.strictEqual(momentsEqual(baseTime, compareTime), false);
  });

  it(`should return false if the date was different`, () => {
    const compareTime = `2018-10-14T10:55:00`;
    assert.strictEqual(momentsEqual(baseTime, compareTime), false);
  });

  it(`should return false if the month was different`, () => {
    const compareTime = `2018-04-02T10:55:00`;
    assert.strictEqual(momentsEqual(baseTime, compareTime), false);
  });

  it(`should return false if the year was different`, () => {
    const compareTime = `2011-10-02T10:55:00`;
    assert.strictEqual(momentsEqual(baseTime, compareTime), false);
  });

});