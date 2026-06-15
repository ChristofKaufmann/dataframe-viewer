// Messages exchanged between the extension host and the webview.
// Rows are transferred lazily in fixed-size chunks so large files
// never have to cross the message channel all at once.

export const CHUNK_SIZE = 500;

/** Webview -> extension host */
export interface HeatmapChoices {
  colormap?: string;
  center?: boolean;
  columnwise?: boolean;
  colorizeNumeric?: boolean;
  colorizeDatetime?: boolean;
  colorizeCategorical?: boolean;
}

export type WebviewMessage =
  | ({ type: 'ready' } & HeatmapChoices)
  | ({ type: 'refresh' } & HeatmapChoices)
  | { type: 'rows'; chunk: number }
  /** Persist heatmap UI choices so they carry over to the next view. */
  | {
      type: 'settings';
      colormap: string;
      center: boolean;
      columnwise: boolean;
      colorizeNumeric: boolean;
      colorizeDatetime: boolean;
      colorizeCategorical: boolean;
    };

/** Extension host -> webview */
export type HostMessage =
  | {
      type: 'init';
      fileName: string;
      /** Optional extra status text, e.g. a truncation notice. */
      note?: string;
      columns: string[];
      rowCount: number;
      /** First rows, used for column width/type estimation and initial paint. */
      sample: string[][];
      /** Heatmap colors for the sample rows, or null when no heatmap applies. */
      sampleColors: (string | null)[][] | null;
    }
  | {
      type: 'rows';
      chunk: number;
      rows: string[][];
      /** Heatmap colors aligned to `rows`, or null when no heatmap applies. */
      colors: (string | null)[][] | null;
    }
  | { type: 'error'; message: string };
