const DELIMITERS_ENTRIES = [
  ["\t", 10],
  [",", 8],
  [";", 4],
  ["|", 3],
  [" ", 1],
  ["\u001F", 0],
  ["^", 0],
  ["~", 0],
  [":", 0],
] as const;

export const DELIMITERS = DELIMITERS_ENTRIES.map(([delimiter]) => delimiter);

export type Delimiter = (typeof DELIMITERS)[number];

export const DELIMITER_PRIORITY = Object.fromEntries(
  DELIMITERS_ENTRIES,
) as Record<Delimiter, number>;
