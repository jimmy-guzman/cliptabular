/**
 * Auto-detects the delimiter (tabs for Excel, commas for CSV).
 */
function detectDelimiterFromLines(lines: string[]) {
  for (const line of lines.slice(0, 5)) {
    if (line.includes("\t")) {
      return "\t";
    }

    if (line.includes(",")) {
      return ",";
    }
  }

  return ",";
}

/**
 * Returns true if the comma at `commaIndex` is part of a numeric value,
 * e.g. 1,234.56, $1,234.56, -$1,234.56, or 1,234.56%.
 */
function isCommaInNumber(
  text: string,
  commaIndex: number,
  currentCell: string,
) {
  const afterComma = text.slice(commaIndex + 1);
  const afterMatch = /^\d{3}(?=[,.%\s]|$)/.exec(afterComma);

  if (!afterMatch) {
    return false;
  }

  const beforeComma = currentCell;

  if (beforeComma.includes(",")) {
    const lastDigitGroup = /\d{3}$/.exec(beforeComma);

    if (!lastDigitGroup) {
      return false;
    }
  } else {
    const firstGroup = /^-?[$€£¥]?\d{1,3}$/.exec(beforeComma);

    if (!firstGroup) {
      return false;
    }
  }

  return true;
}

type EmptyValue = null | string;

export interface ParseOptions<E extends EmptyValue = null> {
  /** Value to use for empty cells (default: null). */
  emptyValue?: E;
  /** Whether to skip empty rows. */
  skipEmptyRows?: boolean;
  /** Whether to trim whitespace from cells. */
  trim?: boolean;
}

/**
 * Parses clipboard text into a 2D array.
 */
export function parse<E extends EmptyValue = null>(
  clipboardText: string,
  options: ParseOptions<E> = {},
): (E | string)[][] {
  const {
    emptyValue = null as E,
    skipEmptyRows = false,
    trim = true,
  } = options;

  if (!clipboardText) {
    return [];
  }

  const rows = clipboardText.split(/\r?\n/);
  const delimiter = detectDelimiterFromLines(rows);

  if (delimiter === "\t") {
    const result: (E | string)[][] = [];

    for (const row of rows) {
      if (skipEmptyRows && !row.trim()) continue;

      const cells = row.split("\t");
      const processedCells = cells.map((cell) => {
        const trimmedCell = trim ? cell.trim() : cell;

        return trimmedCell === "" ? emptyValue : trimmedCell;
      });

      result.push(processedCells);
    }

    return result;
  }

  const result: (E | string)[][] = [];

  for (const row of rows) {
    if (skipEmptyRows && !row.trim()) continue;

    const cells: (E | string)[] = [];
    let currentCell = "";
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];

      if (char === '"') {
        // Escaped quotes ("")
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        const isPartOfNumber = isCommaInNumber(row, i, currentCell);

        if (isPartOfNumber) {
          currentCell += char;
        } else {
          const trimmedCell = trim ? currentCell.trim() : currentCell;

          cells.push(trimmedCell === "" ? emptyValue : trimmedCell);
          currentCell = "";
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- char is always defined here
        currentCell += char!;
      }
    }

    const trimmedCell = trim ? currentCell.trim() : currentCell;

    cells.push(trimmedCell === "" ? emptyValue : trimmedCell);
    result.push(cells);
  }

  return result;
}
