# cliptabular 📋➡️📊

> Parse clipboard data from Excel, CSV, and other delimited formats into clean rows. Handles tabs, commas, semicolons, pipes, quoted fields, currency, percentages, negative numbers, and the messy reality of spreadsheet copy/paste.

![actions][actions-badge]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![Install Size][install-size-badge]][packagephobia]
[![License][license-badge]][license]

---

## Features

- **Smart delimiter detection** (tabs, commas, semicolons, pipes, spaces, etc.)
- Prefers Excel’s tab-delimited format automatically
- Ignores delimiters inside quotes
- Handles quoted fields (`"Smith, John"`)
- Handles escaped quotes (`""Hello""`)
- Handles numbers with grouping (`1,234.56`)
- Handles currency (`$1,234.56`, `€9,876.54`, `£3,456`, `¥4,567`)
- Handles negative values (`-1,234.56`, `-$99.00`)
- Handles percentages (`15.5%`, `1,234.56%`)
- Handles empty cells and fully empty rows
- Consistent behavior across Excel and CSV
- Zero dependencies

---

## Install

```sh
npm install cliptabular
# or
pnpm add cliptabular
```

---

## Usage

```ts
import { parse } from "cliptabular";

const text = await navigator.clipboard.readText();
const rows = parse(text);
```

---

## Delimiter Detection

`parse` automatically figures out the correct delimiter by analyzing the first lines of clipboard text.

It:

- prefers **tabs** when present (Excel copy/paste)
- detects **commas**, **semicolons**, **pipes**, **spaces**, and more
- ignores delimiters **inside quotes**
- uses headers to improve accuracy
- falls back to **comma** when no structure is detected

---

## Return Type

The return type depends on the `emptyValue` option (`null` by default).

```ts
parse("A,,B");
// => (string | null)[][]

parse("A,,B", { emptyValue: "" });
// => string[][]

parse("A,,B", { emptyValue: "EMPTY" as const });
// => (string | "EMPTY")[][]
```

---

## Options

```ts
/**
 * Options for `parse`.
 *
 * @template E Optional empty cell value type (`null` by default).
 */
export interface ParseOptions<E = null> {
  /**
   * Value to use for empty cells.
   *
   * @default null
   */
  emptyValue?: E;
  /**
   * Pads shorter rows with `emptyValue` so all rows have the same number
   * of columns. Makes the output rectangular.
   *
   * @default false
   */
  padRows?: boolean;
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
   * @default true
   */
  trim?: boolean;
}
```

### Example

```ts
parse("A,,C\n,B,", { emptyValue: "N/A" });
// [
//   ["A", "N/A", "C"],
//   ["N/A", "B", "N/A"]
// ]
```

---

## Examples

### Excel (tab-delimited)

```ts
parse("Name\tAge\tCity\nJohn\t30\tNew York");
// [
//   ["Name", "Age", "City"],
//   ["John", "30", "New York"]
// ]
```

### CSV with commas inside quotes

```ts
parse('"Smith, John","New York, NY"');
// [["Smith, John", "New York, NY"]]
```

### Currency and numbers

```ts
parse("Item,Price\nWidget,$1,234.56");
// [
//   ["Item", "Price"],
//   ["Widget", "$1,234.56"]
// ]
```

### Percentages

```ts
parse("Rate\n15.5%\n1,234.56%");
// [
//   ["Rate"],
//   ["15.5%"],
//   ["1,234.56%"]
// ]
```

### Empty values

```ts
parse("A,,C");
// [["A", null, "C"]]
```

### Skip empty rows

```ts
parse("A,B\n\nC,D", { skipEmptyRows: true });
// [["A","B"],["C","D"]]
```

### Pad rows

```ts
parse("A,B\nC", { padRows: true });
// [["A","B"],["C",null]]
```

```ts
parse("A,B\nC", { padRows: true, emptyValue: "EMPTY" });
// [["A","B"],["C","EMPTY"]]
```

---

[actions-badge]: https://flat.badgen.net/github/checks/jimmy-guzman/cliptabular/main?icon=github
[version-badge]: https://flat.badgen.net/npm/v/cliptabular?icon=npm
[package]: https://www.npmjs.com/package/cliptabular
[downloads-badge]: https://flat.badgen.net/npm/dm/cliptabular?icon=npm
[npmtrends]: https://www.npmtrends.com/cliptabular
[license]: https://github.com/jimmy-guzman/cliptabular/blob/master/LICENSE
[license-badge]: https://flat.badgen.net/github/license/jimmy-guzman/cliptabular?icon=packagephobia
[packagephobia]: https://packagephobia.com/result?p=cliptabular
[install-size-badge]: https://flat.badgen.net/packagephobia/install/cliptabular?icon=packagephobia
