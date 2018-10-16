require('module-alias/register');
const GetInactive = require('@commands/get-inactive.js');
const assert = require('chai').assert;
const sinon = require('sinon');

describe('get-inactive module', () => {
  describe('execute method', () => {

    const defaultDbSet = [
      { 
        user_id: '161221472495468540',
        username: 'KrazyMustard',
        discriminator: '8501',
        last_active: 1539320956106
      },
      {
        user_id: '56122147249546854',
        username: 'InactiveUser',
        discriminator: '1111',
        last_active: 1537753063300
      }
    ];

    const dbQueryAll = sinon.stub();

    const fakeResources = {
      DB: {
        all: dbQueryAll
      }
    };

    const defaultMemberSet = [
      {
        user: {
          username: 'InactiveUser 2',
          discriminator: '1112'
        }
      }
    ];
    defaultMemberSet.size = 1;

    const emptyMemberSet = [];
    emptyMemberSet.size = 0;

    let membersFilter = sinon.stub();

    let sendMessage = sinon.spy();
    let fakeMessage = {
      channel: {
        send: sendMessage
      },
      guild: {
        members: {
          filter: membersFilter
        }
      }
    };

    beforeEach(() => {
      dbQueryAll.resolves(defaultDbSet);
      membersFilter.returns(defaultMemberSet);
    })

    afterEach(() => {
      sendMessage.resetHistory();
    }); 

    it('should send a message containing a list of inactive users if there were any (14 days) and there were none without logged activity', async () => {
      membersFilter.returns(emptyMemberSet);
      await GetInactive.execute(fakeMessage, [], fakeResources);
      assert(sendMessage.calledOnce);
    });

    it(`should send a message containing a list of users who don't have any logged activity and no members with logged activity were inactive`, async () => {
      dbQueryAll.resolves([]);
      await GetInactive.execute(fakeMessage, [], fakeResources);
      assert(sendMessage.calledOnce);
    });

    it(`should send a message declaring that there were no inactive users if none were found (14 days)`, async () => {
      dbQueryAll.resolves([]);
      membersFilter.returns(emptyMemberSet);
      await GetInactive.execute(fakeMessage, [], fakeResources);
      assert(sendMessage.calledWith('No inactive users found. (Last 14 days)'));
    });

    it('should throw an error if a non-integer was passed', () => {
      assert.throws(() => GetInactive.execute(null, ['foo'], null));
    });

    it('should throw an error if a negative integer was passed', () => {
      assert.throws(() => GetInactive.execute(null, ['-5'], null));
    });

    it('should throw an error if a decimal value was passed', () => {
      assert.throws(() => GetInactive.execute(null, ['-0.1'], null));
    })
  })
});