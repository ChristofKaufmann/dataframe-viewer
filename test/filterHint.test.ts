import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterPlaceholder } from '../src/webview/filterHint';
import { ColumnType } from '../src/shared/protocol';

const t = (kind: string): ColumnType => ({ dtype: kind, kind });

// The index clause is built in pandas and passed in opaque; filterPlaceholder
// just ORs it in front of the column clauses (and omits it when null).

test('numeric value clause: > 0, plus notna, with the index clause ORed in', () => {
  const out = filterPlaceholder(
    ['', 'founded', 'city'],
    [t('numeric'), t('numeric'), t('text')],
    [],
    'index != 11'
  );
  assert.equal(out, 'Filter rows, e.g.  index != 11 | (city.notna() & founded > 0)');
});

test('MultiIndex clause (a level reference) is embedded verbatim', () => {
  const out = filterPlaceholder(
    ['country, city', 'population'],
    [t('other'), t('numeric')],
    [],
    "country != 'France'"
  );
  assert.equal(out, "Filter rows, e.g.  country != 'France' | population > 0");
});

test('unnamed MultiIndex uses an ilevel reference, also verbatim', () => {
  const out = filterPlaceholder(['', 'population'], [t('other'), t('numeric')], [], "ilevel_0 != 'FR'");
  assert.equal(out, "Filter rows, e.g.  ilevel_0 != 'FR' | population > 0");
});

test('datetime value clause when there is no numeric column', () => {
  const out = filterPlaceholder(
    ['', 'event', 'name'],
    [t('datetime'), t('datetime'), t('text')],
    [],
    "index != '2020-02-01'"
  );
  assert.equal(
    out,
    "Filter rows, e.g.  index != '2020-02-01' | (name.notna() & event > '1986-06-30')"
  );
});

test('timedelta value clause when there is no numeric/datetime column', () => {
  const out = filterPlaceholder(
    ['', 'task', 'elapsed'],
    [t('text'), t('text'), t('timedelta')],
    [],
    "index != 'b'"
  );
  assert.equal(
    out,
    "Filter rows, e.g.  index != 'b' | (task.notna() & elapsed < '1 days 01:23:45')"
  );
});

test('fallback: last column != its first sample value', () => {
  const out = filterPlaceholder(
    ['', 'city', 'country'],
    [t('text'), t('text'), t('text')],
    [['0', 'Berlin', 'Germany']],
    "index != '1'"
  );
  assert.equal(out, "Filter rows, e.g.  index != '1' | (city.notna() & country != 'Germany')");
});

test('backticks non-identifier names and drops the group for a single column', () => {
  const out = filterPlaceholder(['', 'area km2'], [t('text'), t('numeric')], [], "index != '1'");
  assert.equal(out, "Filter rows, e.g.  index != '1' | `area km2` > 0");
});

test('backticks column names that are Python keywords', () => {
  const out = filterPlaceholder(['', 'class', 'in'], [t('text'), t('numeric'), t('text')], [], "index != '1'");
  assert.equal(out, "Filter rows, e.g.  index != '1' | (`in`.notna() & `class` > 0)");
});

test('omits the index clause when there is none (no rows)', () => {
  const out = filterPlaceholder(['', 'a'], [t('text'), t('numeric')], [], null);
  assert.equal(out, 'Filter rows, e.g.  a > 0');
});

test('generic hint when there are no data columns', () => {
  assert.equal(
    filterPlaceholder([''], [t('text')], [], 'index != 0'),
    'Filter rows with a pandas query expression'
  );
});

test('without dtype info, falls back to the last column and its first value', () => {
  const out = filterPlaceholder(['', 'a', 'b'], null, [['0', 'x', 'y']], "index != '1'");
  assert.equal(out, "Filter rows, e.g.  index != '1' | (a.notna() & b != 'y')");
});
