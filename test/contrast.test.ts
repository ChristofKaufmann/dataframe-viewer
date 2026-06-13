import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idealTextColor } from '../src/webview/contrast';

test('picks white text on dark backgrounds, black on light', () => {
  assert.equal(idealTextColor('#000000'), '#ffffff');
  assert.equal(idealTextColor('#ffffff'), '#000000');
  // viridis endpoints: dark purple -> white text, yellow -> black text.
  assert.equal(idealTextColor('#440154'), '#ffffff');
  assert.equal(idealTextColor('#fde725'), '#000000');
});

test('accepts hex with or without leading #', () => {
  assert.equal(idealTextColor('440154'), '#ffffff');
});

test('falls back to inherit for non-hex input', () => {
  assert.equal(idealTextColor('rgb(1,2,3)'), 'inherit');
  assert.equal(idealTextColor(''), 'inherit');
  assert.equal(idealTextColor('#abc'), 'inherit');
});
