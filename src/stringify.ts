import type { Delimiter } from "./delimiters";

export interface StringifyOptions {
  /**
   * Whether to always quote cells.
   *
   * @default false
   */
  alwaysQuote?: boolean;
  /**
   * Delimiter to use between cells.
   *
   * @default "\t"
   */
  delimiter?: Delimiter;
  /**
   * String to output for empty cells.
   *
   * @default ""
   */
  emptyOutput?: string;
  /**
   * Value that represents "empty" in your data.
   * Cells matching this value will be output as `emptyOutput`.
   *
   * @default null
   */
  emptyValue?: unknown;
  /**
   * Line ending to use.
   *
   * @default "\n"
   */
  lineEnding?: "\n" | "\r" | "\r\n";
}

/**
 * Converts a 2D array of cells into clipboard-style tabular text.
 *
 * - Automatically quotes cells containing the delimiter, quotes, or newlines.
 * - Escapes quotes by doubling them (RFC 4180 CSV standard).
 * - Handles empty values based on `emptyValue` and `emptyOutput` options.
 *
 * @param data A 2D array of cells to stringify.
 *
 * @param options Stringify behavior configuration.
 *
 * @returns Delimited text string suitable for clipboard or file output.
 */
export function stringify(data: unknown[][], options: StringifyOptions = {}) {
  const {
    alwaysQuote = false,
    delimiter = "\t",
    emptyOutput = "",
    lineEnding = "\n",
  } = options;

  const emptyValue = Object.prototype.hasOwnProperty.call(options, "emptyValue")
    ? options.emptyValue
    : null;

  if (data.length === 0) {
    return "";
  }

  const rows: string[] = [];

  for (const row of data) {
    const cells: string[] = [];

    for (const cell of row) {
      const cellValue = cell === emptyValue ? emptyOutput : String(cell);

      const needsQuoting =
        alwaysQuote ||
        cellValue.includes(delimiter) ||
        cellValue.includes('"') ||
        cellValue.includes("\n") ||
        cellValue.includes("\r");

      if (needsQuoting) {
        const escapedValue = cellValue.replaceAll('"', '""');

        cells.push(`"${escapedValue}"`);
      } else {
        cells.push(cellValue);
      }
    }

    rows.push(cells.join(delimiter));
  }

  return rows.join(lineEnding);
}
