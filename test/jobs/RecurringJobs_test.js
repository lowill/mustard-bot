require('module-alias/register');

const assert = require('chai').assert;
const RecurringJobs = require('@jobs/RecurringJobs.js');

describe('Recurring Jobs', function() {

  describe('recurrenceRuleToCronFormat', function() {
    it('should populate a string with default values if the argument object is empty', function() {
      const cronFormat = RecurringJobs.recurrenceRuleToCronFormat({});
      assert.strictEqual(cronFormat, '0 * * * * *');
    });
    it('should populate values as expected', function() {
      const testData = {
        second: 1,
        minute: 2,
        hour: 3,
        date: 4,
        month: 5,
        dayOfWeek: 6
      };
      const cronFormat = RecurringJobs.recurrenceRuleToCronFormat(testData);
      assert.strictEqual(cronFormat, '1 2 3 4 5 6');
    });
  });

});