import { CHUNK_SIZE, HostMessage, WebviewMessage } from '../shared/protocol';
import { autoWidth, cellClass, clampDragWidth, isNumericColumn, maxChars } from './columns';

declare function acquireVsCodeApi(): { postMessage(message: WebviewMessage): void };

const vscode = acquireVsCodeApi();

const ROW_HEIGHT = 24;
const OVERSCAN = 10;
const MAX_CACHED_CHUNKS = 64;

const scroller = document.getElementById('scroller')!;
const headerEl = document.getElementById('header')!;
const bodyEl = document.getElementById('body')!;
const statusEl = document.getElementById('status')!;

// Column 0 is always the DataFrame index (sticky on the left); columns 1..n
// are the data columns. Each row in a chunk follows the same layout.
let columns: string[] = [];
let rowCount = 0;
let gridTemplate = '';
let numericCols: boolean[] = [];
let colWidths: number[] = [];

const chunks = new Map<number, string[][]>();
const pendingChunks = new Set<number>();

window.addEventListener('message', (event: MessageEvent<HostMessage>) => {
  const message = event.data;
  switch (message.type) {
    case 'init':
      columns = message.columns;
      rowCount = message.rowCount;
      initLayout(message.sample);
      // The sample only seeds the cache when it covers all of chunk 0;
      // a partial chunk would otherwise mask the missing rows forever.
      if (rowCount <= message.sample.length) {
        chunks.set(0, message.sample);
      }
      // columns[0] is the index, so the data column count is one less.
      const dataCols = Math.max(0, columns.length - 1);
      statusEl.textContent =
        rowCount === 0 && dataCols === 0
          ? 'Empty'
          : `${rowCount.toLocaleString()} rows × ${dataCols.toLocaleString()} columns` +
            (message.note ? ` — ${message.note}` : '');
      render();
      break;
    case 'rows':
      pendingChunks.delete(message.chunk);
      chunks.set(message.chunk, message.rows);
      evictDistantChunks(message.chunk);
      render();
      break;
  }
});

let renderQueued = false;
function scheduleRender(): void {
  if (!renderQueued) {
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      render();
    });
  }
}
scroller.addEventListener('scroll', scheduleRender);
window.addEventListener('resize', () => render());

function initLayout(sample: string[][]): void {
  colWidths = [];
  numericCols = [];

  for (let c = 0; c < columns.length; c++) {
    const values = sample.map((row) => row[c] ?? '');
    numericCols.push(isNumericColumn(values));
    colWidths.push(autoWidth(maxChars(columns[c], values)));
  }

  headerEl.replaceChildren();
  for (let c = 0; c < columns.length; c++) {
    const cell = document.createElement('div');
    cell.className = classFor('cell head', c);
    cell.textContent = columns[c];
    cell.title = columns[c];
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    handle.addEventListener('pointerdown', (e) => startResize(e, c));
    handle.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      autoFit(c);
    });
    cell.appendChild(handle);
    headerEl.appendChild(cell);
  }

  applyLayout();
}

function classFor(base: string, col: number): string {
  return cellClass(base, { index: col === 0, numeric: numericCols[col] });
}

function applyLayout(): void {
  gridTemplate = colWidths.map((w) => `${w}px`).join(' ');
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  headerEl.style.gridTemplateColumns = gridTemplate;
  headerEl.style.width = `${totalWidth}px`;
  bodyEl.style.width = `${totalWidth}px`;
  bodyEl.style.height = `${rowCount * ROW_HEIGHT}px`;
}

function startResize(event: PointerEvent, col: number): void {
  event.preventDefault();
  event.stopPropagation();
  const handle = event.target as HTMLElement;
  const startX = event.clientX;
  const startWidth = colWidths[col];
  handle.setPointerCapture(event.pointerId);
  handle.classList.add('active');
  document.body.classList.add('resizing');

  const onMove = (e: PointerEvent) => {
    colWidths[col] = clampDragWidth(startWidth + (e.clientX - startX));
    applyLayout();
    scheduleRender();
  };
  const onUp = () => {
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
    handle.classList.remove('active');
    document.body.classList.remove('resizing');
  };
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
}

/** Double-click on a handle: fit the column to its header and cached rows. */
function autoFit(col: number): void {
  let longest = columns[col].length;
  for (const rows of chunks.values()) {
    for (const row of rows) {
      const len = (row[col] ?? '').length;
      if (len > longest) {
        longest = len;
      }
    }
  }
  colWidths[col] = autoWidth(longest);
  applyLayout();
  render();
}

function render(): void {
  if (columns.length === 0) {
    return;
  }
  const first = Math.max(0, Math.floor(scroller.scrollTop / ROW_HEIGHT) - OVERSCAN);
  const last = Math.min(
    rowCount,
    Math.ceil((scroller.scrollTop + scroller.clientHeight) / ROW_HEIGHT) + OVERSCAN
  );

  const fragment = document.createDocumentFragment();
  for (let i = first; i < last; i++) {
    const chunkIndex = Math.floor(i / CHUNK_SIZE);
    const chunk = chunks.get(chunkIndex);
    if (!chunk) {
      requestChunk(chunkIndex);
    }
    const row = chunk?.[i - chunkIndex * CHUNK_SIZE];

    const rowEl = document.createElement('div');
    rowEl.className = i % 2 === 1 ? 'row alt' : 'row';
    rowEl.style.gridTemplateColumns = gridTemplate;
    rowEl.style.top = `${i * ROW_HEIGHT}px`;

    for (let c = 0; c < columns.length; c++) {
      const cell = document.createElement('div');
      cell.className = classFor('cell', c);
      cell.textContent = row ? (row[c] ?? '') : '…';
      rowEl.appendChild(cell);
    }
    fragment.appendChild(rowEl);
  }
  bodyEl.replaceChildren(fragment);
}

function requestChunk(chunkIndex: number): void {
  if (pendingChunks.has(chunkIndex)) {
    return;
  }
  pendingChunks.add(chunkIndex);
  vscode.postMessage({ type: 'rows', chunk: chunkIndex });
}

function evictDistantChunks(currentChunk: number): void {
  if (chunks.size <= MAX_CACHED_CHUNKS) {
    return;
  }
  const sorted = [...chunks.keys()].sort(
    (a, b) => Math.abs(b - currentChunk) - Math.abs(a - currentChunk)
  );
  for (const key of sorted.slice(0, chunks.size - MAX_CACHED_CHUNKS)) {
    chunks.delete(key);
  }
}

vscode.postMessage({ type: 'ready' });
