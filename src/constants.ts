export type Delim = (typeof DELIMS)[number];

export const DELIM_PRIORITY = {
  "\t": 10,
  " ": 1,
  "\u001F": 0,
  ",": 8,
  ":": 0,
  ";": 4,
  "^": 0,
  "|": 3,
  "~": 0,
};

export const DELIMS = [
  "\t",
  ",",
  ";",
  "|",
  " ",
  "^",
  "~",
  ":",
  "\u001F",
] as const;
