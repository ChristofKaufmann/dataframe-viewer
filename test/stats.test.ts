import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatPercent } from '../src/webview/stats';

test('formatPercent rounds to a whole number at 10% and above', () => {
  assert.equal(formatPercent(10), '10%');
  assert.equal(formatPercent(30), '30%');
  assert.equal(formatPercent(33.4), '33%');
  assert.equal(formatPercent(99.6), '100%');
});

test('formatPercent keeps one decimal below 10%', () => {
  assert.equal(formatPercent(0), '0.0%');
  assert.equal(formatPercent(3), '3.0%');
  assert.equal(formatPercent(5.24), '5.2%');
  assert.equal(formatPercent(9.99), '10.0%'); // rounds up but stays below the integer threshold
});
