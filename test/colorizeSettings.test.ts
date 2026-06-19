import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getColorizeSettings, updateColorizeSettings } from '../src/colorizeSettings';

// Minimal stand-in for the bits of ExtensionContext.globalState we use.
function fakeContext(initial: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(initial));
  return {
    globalState: {
      get: (key: string) => store.get(key),
      update: async (key: string, value: unknown) => {
        store.set(key, value);
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

test('defaults to colorize all + viridis + uncentered + columnwise when nothing saved', () => {
  const s = getColorizeSettings(fakeContext());
  assert.deepEqual(s, {
    colorizeNumeric: true,
    colorizeDatetime: true,
    colorizeCategorical: true,
    colorizeText: false,
    colormap: 'viridis',
    center: false,
    columnwise: true,
    showMissing: true,
    showGraphs: true,
  });
});

test('round-trips saved settings', async () => {
  const ctx = fakeContext();
  const saved = {
    colorizeNumeric: false,
    colorizeDatetime: true,
    colorizeCategorical: false,
    colorizeText: false,
    colormap: 'plasma',
    center: true,
    columnwise: true,
    showMissing: false,
    showGraphs: false,
  };
  await updateColorizeSettings(ctx, saved);
  assert.deepEqual(getColorizeSettings(ctx), saved);
});

test('fills in missing fields from a partial saved value', () => {
  const ctx = fakeContext({
    'dataViewer.colorize': { colormap: 'magma', colorizeDatetime: false, showGraphs: false },
  });
  assert.deepEqual(getColorizeSettings(ctx), {
    colorizeNumeric: true,
    colorizeDatetime: false,
    colorizeCategorical: true,
    colorizeText: false,
    colormap: 'magma',
    center: false,
    columnwise: true,
    showMissing: true,
    showGraphs: false,
  });
});
