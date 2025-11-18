# cliptabular 📋↔️📊

> Parse and stringify clipboard data from Excel, CSV, and other delimited formats. Handles tabs, commas, quotes, currency, percentages, and negative numbers.

![actions][actions-badge]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![Install Size][install-size-badge]][packagephobia]
[![License][license-badge]][license]

---

## Features

- **Smart delimiter detection** (tabs, commas, semicolons, pipes, spaces)
- Automatically prefers Excel’s **tab-delimited** format
- Ignores delimiters inside quotes
- Handles quoted fields, escaped quotes, and messy numeric values
- Supports currency, grouping, negatives, and percentages
- Handles empty cells and empty rows cleanly
- **Bidirectional**: parse → arrays, stringify → clipboard text
- **Zero dependencies**

---

## Install

```sh
npm install cliptabular
# or
pnpm add cliptabular
```

---

## Usage

### Parsing

```ts
import { parse } from "cliptabular";

const text = await navigator.clipboard.readText();
const rows = parse(text);
```

#### Examples

```ts
// Excel (tab-delimited)
parse("Name\tAge\nJohn\t30");
// => [["Name","Age"],["John","30"]]
```

```ts
// CSV with quoted commas
parse('"Smith, John","New York, NY"');
// => [["Smith, John", "New York, NY"]]
```

```ts
// Numeric + currency — comma stays inside the value
parse("Item,Price\nWidget,$1,234.56");
// => [["Item","Price"],["Widget","$1,234.56"]]
```

```ts
// Empty cells become null by default
parse("A,,C");
// => [["A", null, "C"]]
```

---

### Stringifying

```ts
import { stringify } from "cliptabular";

const data = [
  ["Name", "Age"],
  ["John", "30"],
];

const text = stringify(data);
// "Name\tAge\nJohn\t30"

await navigator.clipboard.writeText(text);
```

#### Example

```ts
// Tab-delimited by default (Excel-friendly)
stringify([
  ["A", "B"],
  ["C", "D"],
]);
// => "A\tB\nC\tD"
```

---

## Delimiter Detection

`parse` analyzes the first lines of text:

- Tabs (Excel) take priority
- Commas, semicolons, pipes, and spaces detected heuristically
- Delimiters inside quotes are ignored
- Header-shaped rows improve accuracy
- Safe fallback to **comma**

---

## Return Type

```ts
parse("A,,B");
// => (string | null)[][]

parse("A,,B", { emptyValue: "" });
// => string[][]

parse("A,,B", { emptyValue: "EMPTY" });
// => (string | "EMPTY")[][]
```

---

## Parse Options

### `emptyValue`

Value used when a cell is empty.
Default: **`null`**

```ts
parse("A,,C", { emptyValue: "N/A" });
// => [["A", "N/A", "C"]]
```

---

### `padRows`

Pads rows to equal width using `emptyValue`.
Default: **`false`**

```ts
parse("A,B\nC", { padRows: true });
// => [["A","B"],["C",null]]
```

---

### `skipEmptyRows`

Drops fully empty rows.
Default: **`false`**

```ts
parse("A,B\n\nC,D", { skipEmptyRows: true });
// => [["A","B"],["C","D"]]
```

---

### `skipEmptyCells`

Removes empty cells within rows (after trimming).
Takes precedence over `padRows`.
Default: **`false`**

```ts
parse("A,,C\n,B,", { skipEmptyCells: true });
// => [["A","C"],["B"]]
```

---

### `trim`

Trims whitespace inside each cell.
Default: **`true`**

```ts
parse("  A  ,  B  ");
// => [["A","B"]]
```

---

## Stringify Options

### `delimiter`

Default: **`\t`**

```ts
stringify([["A", "B"]], { delimiter: "," });
// => "A,B"
```

---

### `alwaysQuote`

Quote every cell.
Default: **`false`**

```ts
stringify([["A", "B"]], { delimiter: ",", alwaysQuote: true });
// => "\"A\",\"B\""
```

---

### `lineEnding`

Default: **`\n`**

```ts
stringify([["A"], ["B"]], { lineEnding: "\r\n" });
// => "A\r\nB"
```

---

### `emptyValue`

Value considered “empty” in your data.
Default: **`null`**

```ts
stringify([["A", null, "C"]], { delimiter: "," });
// => "A,,C"
```

---

### `emptyOutput`

String to output for empty cells.
Default: **`""`**

```ts
stringify([["A", null, "C"]], {
  delimiter: ",",
  emptyValue: null,
  emptyOutput: "N/A",
});
// => "A,N/A,C"
```

[actions-badge]: https://img.shields.io/github/actions/workflow/status/jimmy-guzman/cliptabular/cd.yml?branch=main&style=flat-square&logo=github
[version-badge]: https://img.shields.io/npm/v/cliptabular?style=flat-square&logo=npm
[package]: https://www.npmjs.com/package/cliptabular
[downloads-badge]: https://img.shields.io/npm/dm/cliptabular?style=flat-square&logo=npm
[npmtrends]: https://www.npmtrends.com/cliptabular
[license]: https://github.com/jimmy-guzman/cliptabular/blob/master/LICENSE
[license-badge]: https://img.shields.io/github/license/jimmy-guzman/cliptabular?style=flat-square&logo=open-source-initiative
[packagephobia]: https://packagephobia.com/result?p=cliptabular
[install-size-badge]: https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json%3Fp=cliptabular&query=$.install.pretty&label=install%20size&style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwM
