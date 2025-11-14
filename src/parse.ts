const TAB = "\t";
const COMMA = ",";

const DELIMITERS_ENTRIES = [
  [TAB, 10],
  [COMMA, 8],
  [";", 4],
  ["|", 3],
  [" ", 1],
  ["\u001F", 0],
  ["^", 0],
  ["~", 0],
  [":", 0],
] as const;

const DELIMITERS = DELIMITERS_ENTRIES.map(([delimiter]) => delimiter);

type Delimiter = (typeof DELIMITERS)[number];

const DELIMITER_PRIORITY = Object.fromEntries(DELIMITERS_ENTRIES) as Record<
  Delimiter,
  number
>;

/**
 * Counts how many times a delimiter appears in a line,
 * ignoring any occurrences inside quoted segments.
 */
function countDelimiterOutsideQuotes(line: string, delimiter: Delimiter) {
  let count = 0;
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (!insideQuotes && char === delimiter) {
      count++;
    }
  }

  return count;
}

interface DelimStats {
  linesWithDelimiter: number;
  total: number;
}

function createHeaderCounts(): Record<Delimiter, number> {
  const headerCounts = {} as Record<Delimiter, number>;

  for (const delimiter of DELIMITERS) {
    headerCounts[delimiter] = 0;
  }

  return headerCounts;
}

function createStats(): Record<Delimiter, DelimStats> {
  const stats = {} as Record<Delimiter, DelimStats>;

  for (const delimiter of DELIMITERS) {
    stats[delimiter] = { linesWithDelimiter: 0, total: 0 };
  }

  return stats;
}

/**
 * Auto-detects the most likely delimiter for a set of lines.
 *
 * - Samples up to the first 20 non-empty lines.
 * - Hard-prefers tabs when present (Excel / TSV clipboard).
 * - Scores each candidate delimiter based on header usage,
 *   per-line consistency, and overall frequency.
 * - Ignores delimiters that appear only inside quotes.
 * - Falls back to comma when no strong candidate is found.
 */
function detectDelimiterFromLines(lines: string[]): Delimiter | typeof COMMA {
  const sample = lines.slice(0, 20).filter((line) => line.length > 0);

  if (sample.length === 0) {
    return COMMA;
  }

  // Hard preference for tabs when they appear outside quotes (Excel / TSV fast-path)
  for (const line of sample) {
    if (countDelimiterOutsideQuotes(line, TAB) > 0) {
      return TAB;
    }
  }

  const [header] = sample;

  const headerCounts = createHeaderCounts();
  const stats = createStats();

  for (const delimiter of DELIMITERS) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- header is guaranteed to exist here
    headerCounts[delimiter] = countDelimiterOutsideQuotes(header!, delimiter);
  }

  const lineCount = sample.length;

  for (const line of sample) {
    for (const delimiter of DELIMITERS) {
      const count = countDelimiterOutsideQuotes(line, delimiter);

      if (count > 0) {
        const delimiterStats = stats[delimiter];

        delimiterStats.total += count;
        delimiterStats.linesWithDelimiter += 1;
      }
    }
  }

  const headerDelimsWithMultiple = DELIMITERS.filter(
    (delimiter) => headerCounts[delimiter] > 1,
  );
  const headerBonusDelim =
    headerDelimsWithMultiple.length === 1 ? headerDelimsWithMultiple[0] : null;

  const hasNonSpaceDelimiter = DELIMITERS.some(
    (delimiter) => delimiter !== " " && stats[delimiter].total > 0,
  );

  let bestDelim: Delimiter | typeof COMMA = COMMA;
  let bestScore = -1;

  for (const delimiter of DELIMITERS) {
    const { linesWithDelimiter, total } = stats[delimiter];

    if (!total) continue;
    if (delimiter === " " && hasNonSpaceDelimiter) continue;

    const headerCount = headerCounts[delimiter];
    const avgCount = total / lineCount;
    const consistency = linesWithDelimiter / lineCount;

    let score =
      headerCount * 3 +
      consistency * 2 * avgCount +
      avgCount * linesWithDelimiter;

    if (headerBonusDelim && delimiter === headerBonusDelim) {
      score *= 1.5;
    }

    score += DELIMITER_PRIORITY[delimiter];

    if (score > bestScore) {
      bestScore = score;
      bestDelim = delimiter;
    }
  }

  if (bestScore <= 0) {
    return COMMA;
  }

  return bestDelim;
}

/**
 * Returns true if the comma at `commaIndex` is part of a numeric value
 * rather than a delimiter.
 *
 * Matches patterns like:
 * - 1,234.56
 * - $1,234.56
 * - -$1,234.56
 * - 1,234.56%
 *
 * and supports multiple 3-digit groups when building up the cell.
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

  if (beforeComma.includes(COMMA)) {
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

export type EmptyValue = null | string;

/**
 * Options for `parse`.
 *
 * @template E Optional empty cell value type (`null` by default).
 */
export interface ParseOptions<E extends EmptyValue = null> {
  /**
   * Value to use for empty cells.
   *
   * Defaults to `null`. Changing this will update the inferred return type.
   */
  emptyValue?: E;
  /**
   * Whether to skip empty rows entirely.
   *
   * Defaults to `false`. When `false`, empty rows are represented as
   * a single-cell row containing the `emptyValue`.
   */
  skipEmptyRows?: boolean;
  /**
   * Whether to trim whitespace from each cell.
   *
   * Defaults to `true`.
   */
  trim?: boolean;
}

/**
 * Parse clipboard-style tabular text into a 2D array of cells.
 *
 * - Auto-detects the delimiter (tabs, commas, semicolons, pipes, spaces, etc.).
 * - Treats Excel tab-delimited clipboard data as a fast path.
 * - Respects quoted fields and escaped quotes.
 * - Preserves numeric commas (currency, thousands separators, percentages)
 *   when comma is the delimiter.
 *
 * @template E Optional empty cell value type (`null` by default).
 *
 * @param clipboardText Raw clipboard text (e.g. from Excel / CSV copy-paste).
 *
 * @param options Parsing behavior configuration.
 *
 * @returns A 2D array of cells, with empty cells mapped to `emptyValue`.
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

  if (delimiter === TAB) {
    const result: (E | string)[][] = [];

    for (const row of rows) {
      if (skipEmptyRows && !row.trim()) continue;

      const cells = row.split(TAB);
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
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        if (delimiter === COMMA && isCommaInNumber(row, i, currentCell)) {
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
