import { bench, describe } from "vitest";

import { parse } from "./parse";

function generateExcelData(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => `Cell${i}_${j}`).join("\t");
  }).join("\n");
}

function generateCSVData(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => `Value${i}_${j}`).join(",");
  }).join("\n");
}

function generateCSVWithNumbers(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => {
      if (j % 3 === 0) return `$${1000 + i * 100},${234 + j}.${56 + i}`;
      if (j % 3 === 1) return `Item ${i}_${j}`;

      return `${i * 1000 + j * 100},${j * 10}`;
    }).join(",");
  }).join("\n");
}

function generateSemicolonData(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => `Data${i}_${j}`).join(";");
  }).join("\n");
}

function generatePipeData(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => `Field${i}_${j}`).join("|");
  }).join("\n");
}

function generateQuotedCSV(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => {
      if (j % 2 === 0) return `"Value with, comma ${i}_${j}"`;

      return `"Value ${i}_${j}"`;
    }).join(",");
  }).join("\n");
}

function generateMixedData(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, i) => {
    return Array.from({ length: cols }, (_, j) => {
      if (j % 4 === 0) return `$${i * 100},${j * 10}.00`;
      if (j % 4 === 1) return `"Text with, comma"`;
      if (j % 4 === 2) return `${i},${j * 100}`;

      return `Simple${i}_${j}`;
    }).join(",");
  }).join("\n");
}

describe("Parse Performance - Small Dataset (50 rows x 5 cols)", () => {
  const excelData = generateExcelData(50, 5);
  const csvData = generateCSVData(50, 5);
  const csvWithNumbers = generateCSVWithNumbers(50, 5);
  const quotedData = generateQuotedCSV(50, 5);

  bench("Excel tab-delimited", () => {
    parse(excelData);
  });

  bench("CSV comma-delimited", () => {
    parse(csvData);
  });

  bench("CSV with numeric commas", () => {
    parse(csvWithNumbers);
  });

  bench("CSV with quoted fields", () => {
    parse(quotedData);
  });
});

describe("Parse Performance - Medium Dataset (500 rows x 10 cols)", () => {
  const excelData = generateExcelData(500, 10);
  const csvData = generateCSVData(500, 10);
  const csvWithNumbers = generateCSVWithNumbers(500, 10);
  const quotedData = generateQuotedCSV(500, 10);

  bench("Excel tab-delimited", () => {
    parse(excelData);
  });

  bench("CSV comma-delimited", () => {
    parse(csvData);
  });

  bench("CSV with numeric commas", () => {
    parse(csvWithNumbers);
  });

  bench("CSV with quoted fields", () => {
    parse(quotedData);
  });
});

describe("Parse Performance - Large Dataset (1000 rows x 20 cols)", () => {
  const excelData = generateExcelData(1000, 20);
  const csvData = generateCSVData(1000, 20);
  const csvWithNumbers = generateCSVWithNumbers(1000, 20);
  const quotedData = generateQuotedCSV(1000, 20);

  bench("Excel tab-delimited", () => {
    parse(excelData);
  });

  bench("CSV comma-delimited", () => {
    parse(csvData);
  });

  bench("CSV with numeric commas", () => {
    parse(csvWithNumbers);
  });

  bench("CSV with quoted fields", () => {
    parse(quotedData);
  });
});

describe("Parse Performance - Extra Large Dataset (5000 rows x 30 cols)", () => {
  const excelData = generateExcelData(5000, 30);
  const csvData = generateCSVData(5000, 30);
  const csvWithNumbers = generateCSVWithNumbers(5000, 30);

  bench("Excel tab-delimited", () => {
    parse(excelData);
  });

  bench("CSV comma-delimited", () => {
    parse(csvData);
  });

  bench("CSV with numeric commas", () => {
    parse(csvWithNumbers);
  });
});

describe("Delimiter Detection Performance", () => {
  const tabData = generateExcelData(100, 10);
  const commaData = generateCSVData(100, 10);
  const semicolonData = generateSemicolonData(100, 10);
  const pipeData = generatePipeData(100, 10);
  const mixedData = generateMixedData(100, 10);

  bench("Detect tabs (fast path)", () => {
    parse(tabData);
  });

  bench("Detect commas", () => {
    parse(commaData);
  });

  bench("Detect semicolons", () => {
    parse(semicolonData);
  });

  bench("Detect pipes", () => {
    parse(pipeData);
  });

  bench("Detect with mixed content", () => {
    parse(mixedData);
  });
});

describe("Parse Options Performance - Medium Dataset (500 rows x 10 cols)", () => {
  const csvData = generateCSVData(500, 10);

  bench("Default options", () => {
    parse(csvData);
  });

  bench("With trim disabled", () => {
    parse(csvData, { trim: false });
  });

  bench("With skipEmptyRows", () => {
    parse(csvData, { skipEmptyRows: true });
  });

  bench("With skipEmptyCells", () => {
    parse(csvData, { skipEmptyCells: true });
  });

  bench("With padRows", () => {
    parse(csvData, { padRows: true });
  });

  bench("With custom emptyValue", () => {
    parse(csvData, { emptyValue: "" });
  });

  bench("All options combined", () => {
    parse(csvData, {
      emptyValue: "",
      skipEmptyRows: true,
      trim: false,
    });
  });
});

describe("Edge Cases Performance", () => {
  const emptyData = "";
  const singleCell = "value";

  const singleColumn = "value1\nvalue2\nvalue3";
  const manyColumns = Array.from({ length: 100 }, (_, i) => `col${i}`).join(
    ",",
  );
  const escapedQuotes = Array.from({ length: 100 }, () => {
    return '"Value ""escaped"" text"';
  }).join("\n");

  bench("Empty string", () => {
    parse(emptyData);
  });

  bench("Single cell", () => {
    parse(singleCell);
  });

  bench("Single row (100 columns)", () => {
    parse(manyColumns);
  });

  bench("Single column (100 rows)", () => {
    parse(singleColumn);
  });

  bench("Escaped quotes (100 rows)", () => {
    parse(escapedQuotes);
  });
});

describe("Real-World Scenarios", () => {
  // Simulate Excel clipboard copy
  const excelClipboard = generateExcelData(25, 8);

  // Simulate CSV export from database
  const databaseExport = generateCSVWithNumbers(1000, 15);

  // Simulate Google Sheets copy-paste
  const googleSheets = generateExcelData(50, 12);

  // Simulate financial data with currency
  const financialData = Array.from({ length: 250 }, (_, i) => {
    return [
      `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
      `$${(i * 1000).toLocaleString()}.${String(i % 100).padStart(2, "0")}`,
      `Transaction ${i}`,
      i % 2 === 0 ? "Credit" : "Debit",
      `$${((i * 500) % 10_000).toLocaleString()}.00`,
    ].join(",");
  }).join("\n");

  // Simulate user list export
  const userExport = Array.from({ length: 500 }, (_, i) => {
    return [
      `user${i}@example.com`,
      `"Last${i}, First${i}"`,
      `${20 + (i % 60)}`,
      `"Department ${i % 10}"`,
      i % 2 === 0 ? "Active" : "Inactive",
    ].join(",");
  }).join("\n");

  bench("Excel clipboard (25x8)", () => {
    parse(excelClipboard);
  });

  bench("Database export (1000x15)", () => {
    parse(databaseExport);
  });

  bench("Google Sheets (50x12)", () => {
    parse(googleSheets);
  });

  bench("Financial data with currency (250 rows)", () => {
    parse(financialData);
  });

  bench("User list export (500 rows)", () => {
    parse(userExport);
  });
});

describe("Stress Tests", () => {
  // Very wide data
  const wideData = generateExcelData(100, 100);

  // Very long data
  const longData = generateExcelData(10_000, 5);

  // Huge dataset
  const hugeData = generateCSVData(2000, 50);

  bench("Very wide (100x100)", () => {
    parse(wideData);
  });

  bench("Very long (10000x5)", () => {
    parse(longData);
  });

  bench("Huge dataset (2000x50)", () => {
    parse(hugeData);
  });
});
