
// test/retry.test.js

const assert = require('assert');
const { retry } = require('../src/utils/retry');

describe('retry', () => {
  it('should succeed on the first attempt', async () => {
    const asyncFn = async () => 'success';
    const result = await retry(asyncFn);
    assert.strictEqual(result, 'success');
  });

  it('should fail after multiple retries', async () => {
    const asyncFn = async () => { throw new Error('failure'); };
    await assert.rejects(retry(asyncFn, 3, 10), { message: 'failure' });
  });

  it('should succeed after a few retries', async () => {
    let attempts = 0;
    const asyncFn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('failure');
      }
      return 'success';
    };
    const result = await retry(asyncFn, 3, 10);
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 3);
  });
});
