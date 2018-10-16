require('module-alias/register');

const TaviTitle = require('@commands/tavi-title.js');
const assert = require('chai').assert;
const sinon = require('sinon');

describe('tavi-title module', () => {

  const titles = [`[S.A.L.T. Mascot]`, `always yes`, `DJ`];

  const fakeRun = sinon.stub();
  fakeRun.resolves(undefined);
  const fakeAll = sinon.stub();
  fakeAll.resolves(titles);

  const fakeResources = {
    DB: {
      run: fakeRun,
      all: fakeAll
    }
  };

  const sendMessage = sinon.stub();
  sendMessage.resolves(undefined);

  const fakeMessage = {
    author: {
      id: '9999999999999999'
    },
    content: null,
    createdTimestamp: Date.now(),
    channel: {
      send: sendMessage
    }
  };

  beforeEach(() => {
    fakeRun.resetHistory();
    fakeAll.resetHistory();
  });

  afterEach(() => {
    sendMessage.resetHistory();
  })

  describe('execute method', () => {

    it('should fetch the current state of the title if no argument was provided', async () => {
      await TaviTitle.execute(fakeMessage, [], fakeResources);
      assert(fakeAll.calledOnce);
    });

    it(`should send the current title if no argument was provided`, async () => {
      await TaviTitle.execute(fakeMessage, [], fakeResources);
      assert(sendMessage.calledOnce);
    });

    it('should fetch the current state of the title if an argument was provided and add the argument to the database', async () => {
      await TaviTitle.execute(fakeMessage, ['test'], fakeResources);
      assert(fakeAll.calledOnce);
    });

    it('should append a new title to the database if one was passed', async () => {
      await TaviTitle.execute(fakeMessage, ['test'], fakeResources);
      assert(fakeRun.calledOnce);
    });

    it('should send multiple messages if the character limit was reached', async () => {
      await TaviTitle.execute(fakeMessage, ['test'], fakeResources);
      assert(sendMessage.calledOnce);
    });

    it('should throw an error if both prefix and suffix arguments are passed', async () => {      
      let actual = false;
      const expected = true;
      await TaviTitle.execute(fakeMessage, ['--prefix', '--suffix'], fakeResources)
        .catch(() => actual = true);

      assert.strictEqual(actual, expected);
    });

    it(`should throw an error if non-word characters are used as a name`);
  });

  describe('initTable method', () => {
    it('should create a database table provided a name without throwing an error', () => {
      TaviTitle.test.initTable(fakeResources.DB, `tavi`, `prefix`);
      assert(fakeRun.calledOnce);
    });

    it('should throw a TypeError if no name was provided', () => {
      assert.throws(() => TaviTitle.test.initTable(fakeResources.DB));
    });
  });

  describe('getTitle method', () => {
    it('should return all rows in the column if it found an existing table with the provided name', () => {
      TaviTitle.test.getTitle(fakeResources.DB, `tavi`);
      assert(fakeAll.calledOnce);
    });

    it('should throw a TypeError if no name was provided', () => {
      assert.throws(() => TaviTitle.test.getTitle(fakeResources.DB), TypeError);
    });
  });

  describe('addTitle method', () => {
    it('should add a title to the db table', () => {
      TaviTitle.test.addTitle(fakeResources.DB, `tavi`, `test`, `suffix`);
      assert(fakeRun.calledOnce);
    });

    it('should throw a TypeError if no name was passed', () => {
      assert.throws(() => TaviTitle.test.addTitle(fakeResources.DB, null, `test`), TypeError);
    });

    it('should throw a TypeError if no title was passed', () => {
      assert.throws(() => TaviTitle.test.addTitle(fakeResources.DB, `tavi`, null), TypeError);
    });

    it('should throw an Error if neither prefix or suffix was passed', () => {
      assert.throws(() => TaviTitle.test.addTitle(fakeResources.DB, 'tavi', `test`));
    });
  });

  describe('constructTitle method', () => {
    it('should build a title string with the passed affixes', () => {
      const prefixes = ['Grand Series', '[S.A.L.T. Mascot]', 'Big boy'];
      const suffixes = ['burg', 'the bounty stacker'];

      const prefixObjects = prefixes.map(prefix => {return {
        title: prefix,
        affix: 'prefix'
      }});

      const suffixObjects = suffixes.map(suffix => {return {
        title: suffix,
        affix: 'suffix'
      }});

      const affixes = [...prefixObjects, ...suffixObjects];
      const name = 'Tavi';

      const actual = TaviTitle.test.constructTitle(name, affixes);
      const expected = `Grand Series [S.A.L.T. Mascot] Big boy Tavi burg the bounty stacker`;

      assert.strictEqual(actual, expected);
    });
  })
});