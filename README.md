# cliptabular 📋➡️📊

> Parse clipboard data from Excel, CSV, and other delimited formats into clean rows. Handles tabs, commas, quotes, currency, percentages, negative numbers, and the messy reality of spreadsheet copy/paste.

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
- Handles quoted fields and escaped quotes
- Supports numeric grouping, currency, negatives, and percentages
- Handles empty cells and empty rows
- Consistent results across clipboard sources
- **Zero dependencies**

---

## Install

```sh
npm install cliptabular
# or
pnpm add cliptabular
```

## Usage

```ts
import { parse } from "cliptabular";

const text = await navigator.clipboard.readText();
const rows = parse(text);
```

Depending on what was pasted, `parse(...)` adapts automatically:

```ts
// Excel (tab-delimited)
parse("Name\tAge\tCity\nJohn\t30\tNew York");
// => [["Name","Age","City"],["John","30","New York"]]
```

```ts
// CSV with quoted commas
parse('"Smith, John","New York, NY"');
// => [["Smith, John", "New York, NY"]]
```

```ts
// Mixed numeric + currency — commas stay *inside* the value
parse("Item,Price\nWidget,$1,234.56");
// => [["Item","Price"],["Widget","$1,234.56"]]
```

```ts
// Empty cells become `null` by default
parse("A,,C");
// => [["A", null, "C"]]
```

`parse` automatically chooses the right delimiter, ignores delimiters inside quotes, and preserves numeric grouping when comma is part of a number.

---

## Delimiter Detection

`parse` automatically chooses the delimiter by analyzing the first lines of clipboard text:

- tabs (Excel) take priority
- commas, semicolons, pipes, and spaces detected as needed
- delimiters inside quotes are ignored
- header-shaped rows improve accuracy
- safe fallback to **comma**

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

## Options

### `emptyValue`

Value used when a cell is empty.
Default: **`null`**

```ts
parse("A,,C", { emptyValue: "N/A" });
// => [["A", "N/A", "C"]]
```

---

### `padRows`

Pads all rows to the same number of columns using `emptyValue`.
Useful when you want a guaranteed rectangular matrix.
Default: **`false`**

```ts
parse("A,B\nC", { padRows: true });
// => [["A","B"],["C",null]]
```

---

### `skipEmptyRows`

Drops fully empty rows instead of representing them as `[emptyValue]`.
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

Removes leading/trailing whitespace from each cell.
Default: **`true`**

```ts
parse("  A  ,  B  ", { trim: true });
// => [["A", "B"]]
```

[actions-badge]: https://flat.badgen.net/github/checks/jimmy-guzman/cliptabular/main?icon=github
[version-badge]: https://flat.badgen.net/npm/v/cliptabular?icon=npm
[package]: https://www.npmjs.com/package/cliptabular
[downloads-badge]: https://flat.badgen.net/npm/dm/cliptabular?icon=npm
[npmtrends]: https://www.npmtrends.com/cliptabular
[license]: https://github.com/jimmy-guzman/cliptabular/blob/master/LICENSE
[license-badge]: https://flat.badgen.net/github/license/jimmy-guzman/cliptabular?icon=github
[packagephobia]: https://packagephobia.com/result?p=cliptabular
[install-size-badge]: https://flat.badgen.net/packagephobia/install/cliptabular?icon=packagephobia
