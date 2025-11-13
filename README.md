# cliptabular 📋➡️📊

> Parse clipboard data from Excel or CSV into clean rows. Handles tabs, commas, quoted fields, currency, percentages, negative numbers, and the messy reality of spreadsheet copy/paste.

![version][version-badge]  
![downloads][downloads-badge]  
![install size][install-size-badge]  
![license][license-badge]

---

## Features

- Auto-detects Excel (tab-delimited) vs CSV (comma-delimited)
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
type EmptyValue = null | string;

interface ParseOptions<E extends EmptyValue = null> {
  /** Value to use for empty cells (default: null). */
  emptyValue?: E;
  /** Whether to skip empty rows. */
  skipEmptyRows?: boolean;
  /** Whether to trim whitespace from cells. */
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

---

## API

### `parse<E>(text: string, options?: ParseOptions<E>): (string | E)[][]`

### `ParseOptions`

| Option          | Type             | Default |
| --------------- | ---------------- | ------- |
| `emptyValue`    | `null \| string` | `null`  |
| `skipEmptyRows` | `boolean`        | `false` |
| `trim`          | `boolean`        | `true`  |

---

[version-badge]: https://flat.badgen.net/npm/v/cliptabular?icon=npm
[downloads-badge]: https://flat.badgen.net/npm/dm/cliptabular?icon=npm
[install-size-badge]: https://flat.badgen.net/packagephobia/install/cliptabular?icon=packagephobia
[license-badge]: https://flat.badgen.net/github/license/jimmy-guzman/cliptabular?icon=github
