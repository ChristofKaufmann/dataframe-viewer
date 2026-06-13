import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, '../media/style.css'), 'utf8');

/**
 * Minimal CSS specificity score (id*100 + class/attr/pseudo-class). Treats
 * :not() as transparent (its argument counts, the :not itself does not),
 * matching the spec. Good enough for this stylesheet's class-only selectors.
 */
function specificity(selector: string): number {
  const flat = selector.replace(/:not\(([^)]*)\)/g, ' $1 ');
  const ids = (flat.match(/#[A-Za-z0-9_-]+/g) ?? []).length;
  const classes = (flat.match(/\.[A-Za-z0-9_-]+/g) ?? []).length;
  const attrs = (flat.match(/\[[^\]]+\]/g) ?? []).length;
  const pseudoClasses = (flat.match(/(?<!:):[A-Za-z-]+/g) ?? []).length;
  return ids * 100 + classes + attrs + pseudoClasses;
}

test('specificity helper matches known CSS values', () => {
  assert.equal(specificity('.row.alt .cell:not(.indexcol)'), 4);
  assert.equal(specificity('.row:hover .cell'), 3);
  assert.equal(specificity('.row.alt:hover .cell:not(.indexcol)'), 5);
  assert.equal(specificity('#id .x'), 101);
});

const STRIPE = '.row.alt .cell:not(.indexcol)';
const HOVER_ALL = '.row:hover .cell';
const HOVER_ALT = '.row.alt:hover .cell:not(.indexcol)';

test('the zebra-stripe and both hover selectors are present', () => {
  for (const sel of [STRIPE, HOVER_ALL, HOVER_ALT]) {
    assert.ok(css.includes(sel), `missing selector: ${sel}`);
  }
});

test('hover on alt-row data cells outranks the zebra stripe', () => {
  // Higher specificity, and declared later so it wins even on a tie.
  assert.ok(specificity(HOVER_ALT) >= specificity(STRIPE));
  assert.ok(
    css.indexOf(HOVER_ALT) > css.indexOf(STRIPE),
    'hover rule must come after the stripe rule in source order'
  );
});
