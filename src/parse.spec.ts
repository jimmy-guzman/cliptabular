import { parse } from "./parse";

describe("parse", () => {
  describe("Line ending handling", () => {
    it("should handle Unix line endings (LF)", () => {
      const input = "A\tB\nC\tD\nE\tF";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
      ]);
    });

    it("should handle Windows line endings (CRLF)", () => {
      const input = "A\tB\r\nC\tD\r\nE\tF";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
      ]);
    });

    it("should handle legacy Mac line endings (CR)", () => {
      const input = "A\tB\rC\tD\rE\tF";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
      ]);
    });

    it("should handle mixed line endings", () => {
      const input = "A\tB\r\nC\tD\nE\tF\rG\tH";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
        ["G", "H"],
      ]);
    });

    it("should handle CSV with Unix line endings (LF)", () => {
      const input = "Name,Age\nJohn,30\nJane,25";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age"],
        ["John", "30"],
        ["Jane", "25"],
      ]);
    });

    it("should handle CSV with Windows line endings (CRLF)", () => {
      const input = "Name,Age\r\nJohn,30\r\nJane,25";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age"],
        ["John", "30"],
        ["Jane", "25"],
      ]);
    });

    it("should handle CSV with legacy Mac line endings (CR)", () => {
      const input = "Name,Age\rJohn,30\rJane,25";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age"],
        ["John", "30"],
        ["Jane", "25"],
      ]);
    });

    it("should handle empty lines with different line endings", () => {
      const input = "A,B\r\n\r\nC,D\n\nE,F\r\rG,H";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        [null],
        ["C", "D"],
        [null],
        ["E", "F"],
        [null],
        ["G", "H"],
      ]);
    });

    it("should handle trailing line ending (CRLF)", () => {
      const input = "A,B\r\nC,D\r\n";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], ["C", "D"], [null]]);
    });

    it("should handle trailing line ending (LF)", () => {
      const input = "A,B\nC,D\n";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], ["C", "D"], [null]]);
    });

    it("should handle trailing line ending (CR)", () => {
      const input = "A,B\rC,D\r";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], ["C", "D"], [null]]);
    });

    it("should skip empty rows with mixed line endings when skipEmptyRows is true", () => {
      const input = "A,B\r\n\r\nC,D\n\nE,F\r\rG,H";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
        ["G", "H"],
      ]);
    });
  });

  describe("Excel (tab-delimited) parsing", () => {
    it("should parse simple tab-delimited data", () => {
      const input = "Name\tAge\tCity\nJohn\t30\tNew York\nJane\t25\tBoston";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["John", "30", "New York"],
        ["Jane", "25", "Boston"],
      ]);
    });

    it("should handle empty cells in tab-delimited data with null default", () => {
      const input = "A\t\tC\n\tB\t";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", null, "C"],
        [null, "B", null],
      ]);
    });

    it("should handle empty cells with custom empty value", () => {
      const input = "A\t\tC\n\tB\t";
      const result = parse(input, { emptyValue: "" });

      expect(result).toStrictEqual([
        ["A", "", "C"],
        ["", "B", ""],
      ]);
    });

    it("should keep empty rows by default", () => {
      const input = "A\tB\n\nC\tD\n";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], [null], ["C", "D"], [null]]);
    });

    it("should skip empty rows when skipEmptyRows is true", () => {
      const input = "A\tB\n\nC\tD";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should trim cells by default", () => {
      const input = "  A  \t  B  \n  C  \t  D  ";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should not trim cells when trim is false", () => {
      const input = "  A  \t  B  ";
      const result = parse(input, { trim: false });

      expect(result).toStrictEqual([["  A  ", "  B  "]]);
    });
  });

  describe("CSV parsing", () => {
    it("should parse simple comma-delimited data", () => {
      const input = "Name,Age,City\nJohn,30,New York\nJane,25,Boston";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["John", "30", "New York"],
        ["Jane", "25", "Boston"],
      ]);
    });

    it("should handle quoted strings with commas inside", () => {
      const input =
        'Name,City\n"Smith, John","New York, NY"\n"Doe, Jane","Boston, MA"';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "City"],
        ["Smith, John", "New York, NY"],
        ["Doe, Jane", "Boston, MA"],
      ]);
    });

    it("should handle escaped quotes inside quoted strings", () => {
      const input =
        'Name,Quote\n"John","He said ""Hello"""\n"Jane","She said ""Hi"""';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Quote"],
        ["John", 'He said "Hello"'],
        ["Jane", 'She said "Hi"'],
      ]);
    });

    it("should handle mixed quoted and numeric values", () => {
      const input =
        'Name,Amount,Note\n"Smith, John",1,234.56,"Total, paid"\nJane,5,678.90,Pending';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Amount", "Note"],
        ["Smith, John", "1,234.56", "Total, paid"],
        ["Jane", "5,678.90", "Pending"],
      ]);
    });

    it("should handle empty cells in CSV with null default", () => {
      const input = "A,,C\n,B,";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", null, "C"],
        [null, "B", null],
      ]);
    });

    it('should treat "" as an empty cell', () => {
      const input = 'A,"",C';
      const result = parse(input);

      expect(result).toStrictEqual([["A", null, "C"]]);
    });

    it("should handle Windows line endings (CRLF) for CSV", () => {
      const input = "A,B\r\nC,D\r\nE,F";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
        ["E", "F"],
      ]);
    });
  });

  describe("Numeric comma handling", () => {
    it("should handle numbers with comma separators", () => {
      const input = "Item,Price\nWidget,1,234.56\nGadget,987,654.32";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Item", "Price"],
        ["Widget", "1,234.56"],
        ["Gadget", "987,654.32"],
      ]);
    });

    it("should handle currency values with commas", () => {
      const input = "Item,Price\nWidget,$1,234.56\nGadget,€9,876.54";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Item", "Price"],
        ["Widget", "$1,234.56"],
        ["Gadget", "€9,876.54"],
      ]);
    });

    it("should handle multiple currency symbols", () => {
      const input = "USD,EUR,GBP,YEN\n$1,234.56,€2,345.67,£3,456.78,¥4,567";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["USD", "EUR", "GBP", "YEN"],
        ["$1,234.56", "€2,345.67", "£3,456.78", "¥4,567"],
      ]);
    });

    it("should handle large numbers with multiple comma separators", () => {
      const input = "Amount\n1,234,567.89\n9,876,543.21";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Amount"],
        ["1,234,567.89"],
        ["9,876,543.21"],
      ]);
    });

    it("should distinguish between delimiter commas and number commas", () => {
      const input =
        "Name,Amount,Status\nJohn,1,234.56,Active\nJane,2,345.67,Pending";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Amount", "Status"],
        ["John", "1,234.56", "Active"],
        ["Jane", "2,345.67", "Pending"],
      ]);
    });

    it("should handle negative currency values with commas", () => {
      const input = "Item,Amount\nRefund,-$1,234.56\nCharge,$2,345.67";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Item", "Amount"],
        ["Refund", "-$1,234.56"],
        ["Charge", "$2,345.67"],
      ]);
    });

    it("should handle negative numbers with multiple currency symbols", () => {
      const input = "USD,EUR,GBP\n-$1,234.56,-€2,345.67,-£3,456.78";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["USD", "EUR", "GBP"],
        ["-$1,234.56", "-€2,345.67", "-£3,456.78"],
      ]);
    });

    it("should handle negative numbers without currency", () => {
      const input = "Value\n-1,234.56\n-9,876.54";
      const result = parse(input);

      expect(result).toStrictEqual([["Value"], ["-1,234.56"], ["-9,876.54"]]);
    });

    it("should handle large negative numbers", () => {
      const input = "Amount\n-1,234,567.89";
      const result = parse(input);

      expect(result).toStrictEqual([["Amount"], ["-1,234,567.89"]]);
    });

    it("should handle percentages with comma separators", () => {
      const input = "Rate\n1,234.56%\n5,678.90%";
      const result = parse(input);

      expect(result).toStrictEqual([["Rate"], ["1,234.56%"], ["5,678.90%"]]);
    });

    it("should handle percentages in mixed data", () => {
      const input =
        "Metric,Value,Change\nRevenue,$1,234.56,+15.5%\nProfit,$2,345.67,-5.2%";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Metric", "Value", "Change"],
        ["Revenue", "$1,234.56", "+15.5%"],
        ["Profit", "$2,345.67", "-5.2%"],
      ]);
    });

    it("should handle large percentages with commas", () => {
      const input = "Growth\n1,234%";
      const result = parse(input);

      expect(result).toStrictEqual([["Growth"], ["1,234%"]]);
    });

    it("should handle percentage without comma separator", () => {
      const input = "Rate\n15.5%\n25.8%";
      const result = parse(input);

      expect(result).toStrictEqual([["Rate"], ["15.5%"], ["25.8%"]]);
    });

    it("should handle plain numbers without comma separators", () => {
      const input = "Amount\n1234.56\n5678.90";
      const result = parse(input);

      expect(result).toStrictEqual([["Amount"], ["1234.56"], ["5678.90"]]);
    });

    it("should handle currency without comma separator", () => {
      const input = "Price\n$1234.56\n€5678.90";
      const result = parse(input);

      expect(result).toStrictEqual([["Price"], ["$1234.56"], ["€5678.90"]]);
    });

    it("should handle one digit before comma", () => {
      expect(parse("Value\n$1,234")).toStrictEqual([["Value"], ["$1,234"]]);
    });

    it("should handle two digits before comma", () => {
      expect(parse("Value\n$12,345")).toStrictEqual([["Value"], ["$12,345"]]);
    });

    it("should handle three digits before comma", () => {
      expect(parse("Value\n$123,456")).toStrictEqual([["Value"], ["$123,456"]]);
    });

    it("should handle valid two-digit number groups", () => {
      expect(parse("A,B,C\n99,100,99000")).toStrictEqual([
        ["A", "B", "C"],
        ["99,100", "99000"],
      ]);
    });
  });

  describe("Comma splitting (invalid number patterns)", () => {
    it("should split when comma is followed by 4+ digits", () => {
      expect(parse("Value\n1,2345")).toStrictEqual([["Value"], ["1", "2345"]]);
    });

    it("should split when comma is followed by less than 3 digits", () => {
      const input = "Value\n1,23";
      const result = parse(input);

      expect(result).toStrictEqual([["Value"], ["1", "23"]]);
    });

    it("should split plain single-digit values", () => {
      expect(parse("A,B,C\n1,2,3")).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should split text values", () => {
      expect(parse("Text\nHello,World")).toStrictEqual([
        ["Text"],
        ["Hello", "World"],
      ]);
    });

    it("should split when there are 4+ digits before first comma", () => {
      expect(parse("Value\n1234,567")).toStrictEqual([
        ["Value"],
        ["1234", "567"],
      ]);
    });

    it("should split when middle group has only 2 digits", () => {
      expect(parse("Value\n1,234,56.78")).toStrictEqual([
        ["Value"],
        ["1,234", "56.78"],
      ]);
    });

    it("should split at currency symbol without digits", () => {
      expect(parse("Value\n$,100")).toStrictEqual([["Value"], ["$", "100"]]);
    });

    it("should split when comma has no value before it", () => {
      expect(parse("Value\n,100")).toStrictEqual([["Value"], [null, "100"]]);
    });

    it("should handle multiple consecutive commas as empty cells with null", () => {
      const input = "A,,C\nD,,F";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", null, "C"],
        ["D", null, "F"],
      ]);
    });

    it("should split malformed number then keep valid number", () => {
      expect(parse("Value\n$1,234,56,789")).toStrictEqual([
        ["Value"],
        ["$1,234", "56,789"],
      ]);
    });

    it("should split when sign comes after currency symbol", () => {
      const input = "Value\n$-1,234.56";
      const result = parse(input);

      expect(result).toStrictEqual([["Value"], ["$-1", "234.56"]]);
    });
  });

  describe("Empty value configuration", () => {
    it("should use null as default empty value", () => {
      const input = "A,,C\n,B,";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", null, "C"],
        [null, "B", null],
      ]);
    });

    it("should use empty string when configured", () => {
      const input = "A,,C\n,B,";
      const result = parse(input, { emptyValue: "" });

      expect(result).toStrictEqual([
        ["A", "", "C"],
        ["", "B", ""],
      ]);
    });

    it("should use undefined when configured", () => {
      const input = "A,,C\n,B,";
      const result = parse(input, { emptyValue: undefined });

      expect(result).toStrictEqual([
        ["A", undefined, "C"],
        [undefined, "B", undefined],
      ]);
    });

    it("should use Symbol when configured", () => {
      const input = "A,,C\n,B,";
      const EMPTY = Symbol("empty");
      const result = parse(input, { emptyValue: EMPTY });

      expect(result).toStrictEqual([
        ["A", EMPTY, "C"],
        [EMPTY, "B", EMPTY],
      ]);
    });

    it("should use custom string as empty value", () => {
      const input = "A,,C\n,B,";
      const result = parse(input, { emptyValue: "N/A" });

      expect(result).toStrictEqual([
        ["A", "N/A", "C"],
        ["N/A", "B", "N/A"],
      ]);
    });

    it("should handle empty rows with custom empty value", () => {
      const input = "A,B\n\nC,D";
      const result = parse(input, { emptyValue: "-" });

      expect(result).toStrictEqual([["A", "B"], ["-"], ["C", "D"]]);
    });

    it("should handle tab-delimited empty cells with custom empty value", () => {
      const input = "A\t\tC\n\tB\t";
      const result = parse(input, { emptyValue: "EMPTY" });

      expect(result).toStrictEqual([
        ["A", "EMPTY", "C"],
        ["EMPTY", "B", "EMPTY"],
      ]);
    });

    it("should handle mixed empty cells and whitespace with trim", () => {
      const input = "A,  ,C\n ,B, ";
      const result = parse(input, { emptyValue: null, trim: true });

      expect(result).toStrictEqual([
        ["A", null, "C"],
        [null, "B", null],
      ]);
    });

    it("should preserve whitespace when trim is false with null empty value", () => {
      const input = "A,  ,C\n ,B, ";
      const result = parse(input, { emptyValue: null, trim: false });

      expect(result).toStrictEqual([
        ["A", "  ", "C"],
        [" ", "B", " "],
      ]);
    });

    it("should handle multiple consecutive empty cells", () => {
      const input = "A,,,D\n,,B,";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", null, null, "D"],
        [null, null, "B", null],
      ]);
    });

    it("should handle empty row between data with skipEmptyRows false", () => {
      const input = "Name,Value\nA,1\n\nB,2";
      const result = parse(input, { skipEmptyRows: false });

      expect(result).toStrictEqual([
        ["Name", "Value"],
        ["A", "1"],
        [null],
        ["B", "2"],
      ]);
    });

    it("should skip empty row between data with skipEmptyRows true", () => {
      const input = "Name,Value\nA,1\n\nB,2";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["Name", "Value"],
        ["A", "1"],
        ["B", "2"],
      ]);
    });

    it("should handle multiple empty rows in sequence", () => {
      const input = "A,B\n\n\nC,D";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], [null], [null], ["C", "D"]]);
    });

    it("should skip multiple empty rows when skipEmptyRows is true", () => {
      const input = "A,B\n\n\nC,D";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should handle leading empty rows", () => {
      const input = "\n\nA,B\nC,D";
      const result = parse(input);

      expect(result).toStrictEqual([[null], [null], ["A", "B"], ["C", "D"]]);
    });

    it("should skip leading empty rows when skipEmptyRows is true", () => {
      const input = "\n\nA,B\nC,D";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should handle trailing empty rows", () => {
      const input = "A,B\nC,D\n\n";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], ["C", "D"], [null], [null]]);
    });

    it("should skip trailing empty rows when skipEmptyRows is true", () => {
      const input = "A,B\nC,D\n\n";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should handle only empty rows", () => {
      const input = "\n\n\n";
      const result = parse(input);

      expect(result).toStrictEqual([[null], [null], [null], [null]]);
    });

    it("should return empty array for only empty rows when skipEmptyRows is true", () => {
      const input = "\n\n\n";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([]);
    });

    it("should handle whitespace-only cells as empty with trim", () => {
      const input = "A,   ,C\n   ,B,   ";
      const result = parse(input, { emptyValue: "BLANK", trim: true });

      expect(result).toStrictEqual([
        ["A", "BLANK", "C"],
        ["BLANK", "B", "BLANK"],
      ]);
    });

    it("should combine skipEmptyRows and custom emptyValue", () => {
      const input = "A,,C\n\nD,E,\n\n";
      const result = parse(input, {
        emptyValue: "0",
        skipEmptyRows: true,
      });

      expect(result).toStrictEqual([
        ["A", "0", "C"],
        ["D", "E", "0"],
      ]);
    });

    it("should treat a row of quoted empty cells as non-empty row", () => {
      const input = 'A,B,C\n"","",""';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        [null, null, null],
      ]);
    });
  });

  describe("Edge cases", () => {
    it("should return empty array for empty string", () => {
      expect(parse("")).toStrictEqual([]);
    });

    it("should return empty array for null", () => {
      expect(parse(null as unknown as string)).toStrictEqual([]);
    });

    it("should return empty array for undefined", () => {
      expect(parse(undefined as unknown as string)).toStrictEqual([]);
    });

    it("should handle single cell", () => {
      expect(parse("Hello")).toStrictEqual([["Hello"]]);
    });

    it("should handle single row with multiple cells", () => {
      expect(parse("A,B,C")).toStrictEqual([["A", "B", "C"]]);
    });

    it("should handle trailing newline", () => {
      const input = "A,B\nC,D\n";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], ["C", "D"], [null]]);
    });

    it("should keep whitespace-only rows by default", () => {
      const input = "A,B\n   \nC,D";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B"], [null], ["C", "D"]]);
    });

    it("should skip whitespace-only rows when skipEmptyRows is true", () => {
      const input = "A,B\n   \nC,D";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should handle comma followed by space", () => {
      const input = "A,B, C\nD,E, F";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", "F"],
      ]);
    });

    it("should trim leading and trailing spaces by default", () => {
      const input = " A , B , C \n D , E , F ";
      const result = parse(input, { trim: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", "F"],
      ]);
    });

    it("should preserve spaces when trim is false", () => {
      const input = " A , B \n C , D ";
      const result = parse(input, { trim: false });

      expect(result).toStrictEqual([
        [" A ", " B "],
        [" C ", " D "],
      ]);
    });

    it("should treat unmatched quotes as literal content", () => {
      const input = 'Name,Note\nJohn,"Unclosed quote';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Note"],
        ["John", "Unclosed quote"],
      ]);
    });
  });

  describe("Delimiter detection", () => {
    it("should prefer tabs over commas when both exist", () => {
      const input = "A,B\tC,D\nE,F\tG,H";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A,B", "C,D"],
        ["E,F", "G,H"],
      ]);
    });

    it("should default to comma when no delimiters found", () => {
      const input = "NoDelimitersHere\nJustText";
      const result = parse(input);

      expect(result).toStrictEqual([["NoDelimitersHere"], ["JustText"]]);
    });

    it("should detect delimiter from second line if first has none", () => {
      const input = "Value\n1,234";
      const result = parse(input);

      expect(result).toStrictEqual([["Value"], ["1,234"]]);
    });

    it("should ignore delimiters inside quotes when detecting delimiter", () => {
      const input = '"Hello\tWorld",123';
      const result = parse(input);

      expect(result).toStrictEqual([["Hello\tWorld", "123"]]);
    });
  });

  describe("Additional delimiters & header weighting", () => {
    it("should detect semicolon-delimited data", () => {
      const input = "Name;Age;City\nJohn;30;New York\nJane;25;Boston";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["John", "30", "New York"],
        ["Jane", "25", "Boston"],
      ]);
    });

    it("should detect pipe-delimited data", () => {
      const input = "Name|Age|City\nJohn|30|New York\nJane|25|Boston";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["John", "30", "New York"],
        ["Jane", "25", "Boston"],
      ]);
    });

    it("should detect space-delimited data when spaces are consistent separators", () => {
      const input = "A B C\n1 2 3\n4 5 6";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
        ["4", "5", "6"],
      ]);
    });

    it("should not pick space as delimiter when comma is clearly better", () => {
      const input = "A, B, C\n1, 2, 3";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should detect caret-delimited data", () => {
      const input = "A^B^C\n1^2^3";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should detect tilde-delimited data", () => {
      const input = "A~B~C\n1~2~3";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should detect colon-delimited data", () => {
      const input = "A:B:C\n1:2:3";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should detect unit separator (ASCII 31) as delimiter", () => {
      const us = "\u001F";
      const input = `A${us}B${us}C\n1${us}2${us}3`;
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["1", "2", "3"],
      ]);
    });

    it("should use header delimiter even when body rows are sparse", () => {
      const input = "Name|Age|City|Country\nAlice\nBob\nCharlie";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City", "Country"],
        ["Alice"],
        ["Bob"],
        ["Charlie"],
      ]);
    });

    it("should prefer header delimiter when body lines use different separators", () => {
      const input = "Name,Age,City\nAlice 30 New York\nBob 25 Boston";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["Alice 30 New York"],
        ["Bob 25 Boston"],
      ]);
    });

    it("should prefer comma over semicolon when scores are tied (priority order)", () => {
      const input = "A,B;C\n1,2;3";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["A", "B;C"],
        ["1", "2;3"],
      ]);
    });

    it("should prefer comma over colon when both appear with similar frequency", () => {
      const input = "Name: Alice, Age: 30\nName: Bob, Age: 25";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name: Alice", "Age: 30"],
        ["Name: Bob", "Age: 25"],
      ]);
    });

    it("should ignore candidate delimiters inside quotes for all delimiter types", () => {
      const input = '"Smith; John"|30|"New York, NY"';
      const result = parse(input);

      expect(result).toStrictEqual([["Smith; John", "30", "New York, NY"]]);
    });
  });

  describe("Unicode and special characters", () => {
    it("should handle unicode characters", () => {
      const input =
        "Name,City,Amount\n张三,北京,$1,234.56\nJohn,São Paulo,$2,345.67";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "City", "Amount"],
        ["张三", "北京", "$1,234.56"],
        ["John", "São Paulo", "$2,345.67"],
      ]);
    });

    it("should handle emoji", () => {
      const input = "Status,Count,Value\n✅,100,$1,234.56\n❌,50,$2,345.67";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Status", "Count", "Value"],
        ["✅", "100", "$1,234.56"],
        ["❌", "50", "$2,345.67"],
      ]);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle Excel financial report", () => {
      const input =
        "Product\tRevenue\tProfit\nWidget A\t$1,234,567.89\t$234,567.89\nWidget B\t$987,654.32\t$123,456.78";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Product", "Revenue", "Profit"],
        ["Widget A", "$1,234,567.89", "$234,567.89"],
        ["Widget B", "$987,654.32", "$123,456.78"],
      ]);
    });

    it("should handle CSV export with names and addresses", () => {
      const input =
        '"Smith, John","123 Main St, Apt 4, New York, NY",1,234.56\n"Doe, Jane","456 Oak Ave, Boston, MA",2,345.67';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Smith, John", "123 Main St, Apt 4, New York, NY", "1,234.56"],
        ["Doe, Jane", "456 Oak Ave, Boston, MA", "2,345.67"],
      ]);
    });

    it("should handle financial report with negative values and percentages", () => {
      const input =
        "Account,Q1,Q2,Change\nRevenue,$1,234,567.89,$1,345,678.90,+9.0%\nExpenses,-$234,567.89,-$245,678.90,-4.7%";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Account", "Q1", "Q2", "Change"],
        ["Revenue", "$1,234,567.89", "$1,345,678.90", "+9.0%"],
        ["Expenses", "-$234,567.89", "-$245,678.90", "-4.7%"],
      ]);
    });

    it("should handle data with quotes, numbers, and percentages", () => {
      const input =
        '"Product Name",Price,Discount,Final\n"Widget, Pro",$1,234.56,15.5%,$1,042.61\n"Gadget, Max",$2,345.67,20.0%,$1,876.54';
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Product Name", "Price", "Discount", "Final"],
        ["Widget, Pro", "$1,234.56", "15.5%", "$1,042.61"],
        ["Gadget, Max", "$2,345.67", "20.0%", "$1,876.54"],
      ]);
    });

    it("should handle profit/loss statement", () => {
      const input =
        "Line Item,Amount,% of Total\nRevenue,$1,234,567.89,100.0%\nCOGS,-$567,890.12,-46.0%\nGross Profit,$666,677.77,54.0%";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Line Item", "Amount", "% of Total"],
        ["Revenue", "$1,234,567.89", "100.0%"],
        ["COGS", "-$567,890.12", "-46.0%"],
        ["Gross Profit", "$666,677.77", "54.0%"],
      ]);
    });

    it("should handle mixed currency values", () => {
      const input =
        "Product,USD,EUR\nWidget,$1,234.56,€1,234.56\nGadget,$99,€99";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Product", "USD", "EUR"],
        ["Widget", "$1,234.56", "€1,234.56"],
        ["Gadget", "$99", "€99"],
      ]);
    });

    it("should handle number then percentage", () => {
      const input = "Value,Percent\n1,234,15.5%";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Value", "Percent"],
        ["1,234", "15.5%"],
      ]);
    });

    it("should handle correct number grouping", () => {
      expect(parse("Value\n$1,234,567,890.12")).toStrictEqual([
        ["Value"],
        ["$1,234,567,890.12"],
      ]);
    });
  });

  describe("Performance", () => {
    it("should handle many columns", () => {
      const headers = Array.from({ length: 50 }, (_, i) => `Col${i}`).join(",");
      const data = Array.from({ length: 50 }, (_, i) => `Val${i}`).join(",");
      const input = `${headers}\n${data}`;
      const result = parse(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(50);
      expect(result[1]).toHaveLength(50);
    });

    it("should handle very long cell content", () => {
      const longText = "A".repeat(5000);
      const input = `Text\n${longText}`;
      const result = parse(input);

      expect(result).toStrictEqual([["Text"], [longText]]);
    });

    it("should handle many rows", () => {
      const rows = Array.from({ length: 100 }, (_, i) => {
        return `Row${i},Value${i},${i * 1000}`;
      });
      const input = `Name,Label,Value\n${rows.join("\n")}`;
      const result = parse(input);

      expect(result).toHaveLength(101);
      expect(result[0]).toStrictEqual(["Name", "Label", "Value"]);
      expect(result[1]).toStrictEqual(["Row0", "Value0", "0"]);
      expect(result[100]).toStrictEqual(["Row99", "Value99", "99000"]);
    });
  });

  describe("Cross-format consistency", () => {
    it("should handle empty cells consistently in tab and CSV format", () => {
      const tabInput = "A\t\tC\n\tB\t";
      const csvInput = "A,,C\n,B,";

      const tabResult = parse(tabInput);
      const csvResult = parse(csvInput);

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([
        ["A", null, "C"],
        [null, "B", null],
      ]);
    });

    it("should handle empty rows consistently in tab and CSV format", () => {
      const tabInput = "A\tB\n\nC\tD";
      const csvInput = "A,B\n\nC,D";

      const tabResult = parse(tabInput);
      const csvResult = parse(csvInput);

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([["A", "B"], [null], ["C", "D"]]);
    });

    it("should handle custom empty value consistently in both formats", () => {
      const tabInput = "A\t\tC";
      const csvInput = "A,,C";

      const tabResult = parse(tabInput, { emptyValue: "MISSING" });
      const csvResult = parse(csvInput, { emptyValue: "MISSING" });

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([["A", "MISSING", "C"]]);
    });

    it("should skip empty rows consistently in both formats", () => {
      const tabInput = "A\tB\n\n\nC\tD";
      const csvInput = "A,B\n\n\nC,D";

      const tabResult = parse(tabInput, { skipEmptyRows: true });
      const csvResult = parse(csvInput, { skipEmptyRows: true });

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should handle trim option consistently in both formats", () => {
      const tabInput = "  A  \t  B  ";
      const csvInput = "  A  ,  B  ";

      const tabResult = parse(tabInput, { trim: false });
      const csvResult = parse(csvInput, { trim: false });

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([["  A  ", "  B  "]]);
    });

    it("should handle all options combined consistently", () => {
      const tabInput = "A\t\tC\n\n  D  \t  E  \t";
      const csvInput = "A,,C\n\n  D  ,  E  ,";

      const options = { emptyValue: "N/A", skipEmptyRows: true, trim: true };
      const tabResult = parse(tabInput, options);
      const csvResult = parse(csvInput, options);

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([
        ["A", "N/A", "C"],
        ["D", "E", "N/A"],
      ]);
    });
  });

  describe("padRows option", () => {
    it("should pad shorter rows with null by default", () => {
      const input = "A,B,C\nD,E\nF";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", null],
        ["F", null, null],
      ]);
    });

    it("should pad with custom empty value", () => {
      const input = "A,B,C\nD\nE,F";
      const result = parse(input, { emptyValue: "", padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "", ""],
        ["E", "F", ""],
      ]);
    });

    it("should not pad when padRows is false", () => {
      const input = "A,B,C\nD,E\nF";
      const result = parse(input, { padRows: false });

      expect(result).toStrictEqual([["A", "B", "C"], ["D", "E"], ["F"]]);
    });

    it("should not pad when padRows is omitted (default false)", () => {
      const input = "A,B,C\nD,E\nF";
      const result = parse(input);

      expect(result).toStrictEqual([["A", "B", "C"], ["D", "E"], ["F"]]);
    });

    it("should pad tab-delimited data", () => {
      const input = "A\tB\tC\nD\tE\nF";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", null],
        ["F", null, null],
      ]);
    });

    it("should pad semicolon-delimited data", () => {
      const input = "A;B;C;D\nE;F\nG;H;I";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C", "D"],
        ["E", "F", null, null],
        ["G", "H", "I", null],
      ]);
    });

    it("should handle all rows having the same length", () => {
      const input = "A,B,C\nD,E,F\nG,H,I";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", "F"],
        ["G", "H", "I"],
      ]);
    });

    it("should handle single row", () => {
      const input = "A,B,C";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([["A", "B", "C"]]);
    });

    it("should handle empty input with padRows", () => {
      const input = "";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([]);
    });

    it("should pad rows with skipEmptyRows enabled", () => {
      const input = "A,B,C\n\nD,E\n\nF";
      const result = parse(input, { padRows: true, skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", null],
        ["F", null, null],
      ]);
    });

    it("should pad with custom empty value and skip empty rows", () => {
      const input = "A,B,C\n\nD\n\nE,F";
      const result = parse(input, {
        emptyValue: "N/A",
        padRows: true,
        skipEmptyRows: true,
      });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "N/A", "N/A"],
        ["E", "F", "N/A"],
      ]);
    });

    it("should pad rows with existing empty cells", () => {
      const input = "A,,C,D\n,B\nE,F,G";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", null, "C", "D"],
        [null, "B", null, null],
        ["E", "F", "G", null],
      ]);
    });

    it("should pad with trim enabled", () => {
      const input = "  A  ,  B  ,  C  \n  D  \n  E  ,  F  ";
      const result = parse(input, { padRows: true, trim: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", null, null],
        ["E", "F", null],
      ]);
    });

    it("should pad with trim disabled", () => {
      const input = "  A  ,  B  ,  C  \n  D  \n  E  ,  F  ";
      const result = parse(input, { padRows: true, trim: false });

      expect(result).toStrictEqual([
        ["  A  ", "  B  ", "  C  "],
        ["  D  ", null, null],
        ["  E  ", "  F  ", null],
      ]);
    });

    it("should pad rows with quoted values", () => {
      const input = '"A","B","C"\n"D"\n"E","F"';
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", null, null],
        ["E", "F", null],
      ]);
    });

    it("should pad rows with numeric commas", () => {
      const input = "Name,Amount,Status\nJohn,$1,234.56,Active\nJane,$2,345.67";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["Name", "Amount", "Status"],
        ["John", "$1,234.56", "Active"],
        ["Jane", "$2,345.67", null],
      ]);
    });

    it("should handle very uneven row lengths", () => {
      const input = "A,B,C,D,E,F\nG\nH,I,J\nK,L";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C", "D", "E", "F"],
        ["G", null, null, null, null, null],
        ["H", "I", "J", null, null, null],
        ["K", "L", null, null, null, null],
      ]);
    });

    it("should pad when longest row is in the middle", () => {
      const input = "A,B\nC,D,E,F,G\nH,I";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", null, null, null],
        ["C", "D", "E", "F", "G"],
        ["H", "I", null, null, null],
      ]);
    });

    it("should pad when longest row is at the end", () => {
      const input = "A\nB,C\nD,E,F,G,H";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", null, null, null, null],
        ["B", "C", null, null, null],
        ["D", "E", "F", "G", "H"],
      ]);
    });

    it("should work with all options combined", () => {
      const input = "  A  ,  B  ,  C  \n\n  D  \n\n  E  ,  F  ";
      const result = parse(input, {
        emptyValue: "MISSING",
        padRows: true,
        skipEmptyRows: true,
        trim: true,
      });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "MISSING", "MISSING"],
        ["E", "F", "MISSING"],
      ]);
    });

    it("should pad pipe-delimited data", () => {
      const input = "A|B|C|D\nE|F\nG";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C", "D"],
        ["E", "F", null, null],
        ["G", null, null, null],
      ]);
    });

    it("should pad space-delimited data", () => {
      const input = "A B C D\nE F\nG";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C", "D"],
        ["E", "F", null, null],
        ["G", null, null, null],
      ]);
    });

    it("should maintain rectangular shape for table-like data", () => {
      const input =
        "Name,Age,City,Country\nAlice,30\nBob,25,Boston\nCharlie,35,Chicago,USA";
      const result = parse(input, { padRows: true });

      expect(result).toStrictEqual([
        ["Name", "Age", "City", "Country"],
        ["Alice", "30", null, null],
        ["Bob", "25", "Boston", null],
        ["Charlie", "35", "Chicago", "USA"],
      ]);
    });

    it("should pad with unicode empty value", () => {
      const input = "A,B,C\nD\nE,F";
      const result = parse(input, { emptyValue: "—", padRows: true });

      expect(result).toStrictEqual([
        ["A", "B", "C"],
        ["D", "—", "—"],
        ["E", "F", "—"],
      ]);
    });

    it("should pad correctly with many columns", () => {
      const fullRow = Array.from({ length: 20 }, (_, i) => `Col${i}`).join(",");
      const shortRow = "A,B,C";
      const input = `${fullRow}\n${shortRow}`;
      const result = parse(input, { padRows: true });

      expect(result[0]).toHaveLength(20);
      expect(result[1]).toHaveLength(20);
      expect(result[1]?.[0]).toBe("A");
      expect(result[1]?.[1]).toBe("B");
      expect(result[1]?.[2]).toBe("C");
      expect(result[1]?.[3]).toBeNull();
      expect(result[1]?.[19]).toBeNull();
    });

    it("should pad consistently in tab and CSV format", () => {
      const tabInput = "A\tB\tC\nD\tE\nF";
      const csvInput = "A,B,C\nD,E\nF";

      const tabResult = parse(tabInput, { padRows: true });
      const csvResult = parse(csvInput, { padRows: true });

      expect(tabResult).toStrictEqual(csvResult);
      expect(tabResult).toStrictEqual([
        ["A", "B", "C"],
        ["D", "E", null],
        ["F", null, null],
      ]);
    });
  });

  describe("Examples", () => {
    it("should match README percentage example", () => {
      const input = "Rate\n15.5%\n1,234.56%";
      const result = parse(input);

      expect(result).toStrictEqual([["Rate"], ["15.5%"], ["1,234.56%"]]);
    });

    it("should match README CSV quoted example", () => {
      const input = '"Smith, John","New York, NY"';
      const result = parse(input);

      expect(result).toStrictEqual([["Smith, John", "New York, NY"]]);
    });

    it("should match README currency example", () => {
      const input = "Item,Price\nWidget,$1,234.56";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Item", "Price"],
        ["Widget", "$1,234.56"],
      ]);
    });

    it("should match README empty value example", () => {
      const input = "A,,C\n,B,";
      const result = parse(input, { emptyValue: "N/A" });

      expect(result).toStrictEqual([
        ["A", "N/A", "C"],
        ["N/A", "B", "N/A"],
      ]);
    });

    it("should match README skipEmptyRows example", () => {
      const input = "A,B\n\nC,D";
      const result = parse(input, { skipEmptyRows: true });

      expect(result).toStrictEqual([
        ["A", "B"],
        ["C", "D"],
      ]);
    });

    it("should match README Excel tab example", () => {
      const input = "Name\tAge\tCity\nJohn\t30\tNew York";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["Name", "Age", "City"],
        ["John", "30", "New York"],
      ]);
    });
  });

  describe("Bugs", () => {
    it("should parse values of varying lengths with and without commas", () => {
      const input = "1000, 22,000, 3,500\n4, 500,000,000, 60, 70000";
      const result = parse(input);

      expect(result).toStrictEqual([
        ["1000", "22,000", "3,500"],
        ["4", "500,000,000", "60", "70000"],
      ]);
    });
  });

  describe("skipEmptyCells option", () => {
    describe("Basic functionality", () => {
      it("should skip empty cells in a row", () => {
        const input = "A,,C\n,B,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should skip empty cells with custom empty value", () => {
        const input = "A,,C\n,B,";
        const result = parse(input, {
          emptyValue: "N/A",
          skipEmptyCells: true,
        });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should not skip cells when skipEmptyCells is false", () => {
        const input = "A,,C\n,B,";
        const result = parse(input, { skipEmptyCells: false });

        expect(result).toStrictEqual([
          ["A", null, "C"],
          [null, "B", null],
        ]);
      });

      it("should not skip cells when skipEmptyCells is omitted (default false)", () => {
        const input = "A,,C\n,B,";
        const result = parse(input);

        expect(result).toStrictEqual([
          ["A", null, "C"],
          [null, "B", null],
        ]);
      });
    });

    describe("Empty rows after skipping cells", () => {
      it("should keep empty array when skipEmptyRows is false", () => {
        const input = "A,B,C\n,,\nD,E,F";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: false,
        });

        expect(result).toStrictEqual([["A", "B", "C"], [], ["D", "E", "F"]]);
      });

      it("should remove empty row when skipEmptyRows is true", () => {
        const input = "A,B,C\n,,\nD,E,F";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: true,
        });

        expect(result).toStrictEqual([
          ["A", "B", "C"],
          ["D", "E", "F"],
        ]);
      });

      it("should handle multiple rows becoming empty", () => {
        const input = "A,B\n,\n,,\nC,D";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: true,
        });

        expect(result).toStrictEqual([
          ["A", "B"],
          ["C", "D"],
        ]);
      });

      it("should handle row that was already empty", () => {
        const input = "A,B\n\nC,D";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: false,
        });

        expect(result).toStrictEqual([["A", "B"], [], ["C", "D"]]);
      });
    });

    describe("Interaction with padRows", () => {
      it("should skip cells and NOT pad (skipEmptyCells takes precedence)", () => {
        const input = "A,B,C\nD,,E\nF";
        const result = parse(input, { padRows: true, skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "B", "C"], ["D", "E"], ["F"]]);
      });

      it("should produce uneven rows when both options enabled", () => {
        const input = "A,,C,D\n,B,\nE,F,G";
        const result = parse(input, { padRows: true, skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C", "D"], ["B"], ["E", "F", "G"]]);
      });
    });

    describe("Different delimiters", () => {
      it("should skip empty cells in tab-delimited data", () => {
        const input = "A\t\tC\n\tB\t";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should skip empty cells in semicolon-delimited data", () => {
        const input = "A;;C\n;B;";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should skip empty cells in pipe-delimited data", () => {
        const input = "A||C\n|B|";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should skip empty cells in space-delimited data", () => {
        const input = "A  C\n B ";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });
    });

    describe("Interaction with trim option", () => {
      it("should trim then skip empty cells", () => {
        const input = "A,  ,C\n ,B, ";
        const result = parse(input, { skipEmptyCells: true, trim: true });

        expect(result).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should not skip whitespace-only cells when trim is false", () => {
        const input = "A,  ,C\n ,B, ";
        const result = parse(input, { skipEmptyCells: true, trim: false });

        expect(result).toStrictEqual([
          ["A", "  ", "C"],
          [" ", "B", " "],
        ]);
      });
    });

    describe("Edge cases", () => {
      it("should handle all empty cells in a row with skipEmptyRows false", () => {
        const input = ",,";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: false,
        });

        expect(result).toStrictEqual([[]]);
      });

      it("should remove row with all empty cells when skipEmptyRows true", () => {
        const input = ",,";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: true,
        });

        expect(result).toStrictEqual([]);
      });

      it("should handle row with only one non-empty cell", () => {
        const input = ",,A,,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A"]]);
      });

      it("should handle no empty cells", () => {
        const input = "A,B,C\nD,E,F";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([
          ["A", "B", "C"],
          ["D", "E", "F"],
        ]);
      });

      it("should handle single cell with value", () => {
        const input = "A";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A"]]);
      });

      it("should handle single empty cell", () => {
        const input = "";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([]);
      });

      it("should handle row with leading empty cells", () => {
        const input = ",,A,B";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "B"]]);
      });

      it("should handle row with trailing empty cells", () => {
        const input = "A,B,,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "B"]]);
      });

      it("should handle row with empty cells in middle", () => {
        const input = "A,,,B";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "B"]]);
      });
    });

    describe("Quoted values", () => {
      it("should skip quoted empty cells", () => {
        const input = '"A","","C"';
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([["A", "C"]]);
      });

      it("should not skip quoted whitespace when trim is false", () => {
        const input = '"A"," ","C"';
        const result = parse(input, { skipEmptyCells: true, trim: false });

        expect(result).toStrictEqual([["A", " ", "C"]]);
      });

      it("should skip quoted whitespace when trim is true", () => {
        const input = '"A"," ","C"';
        const result = parse(input, { skipEmptyCells: true, trim: true });

        expect(result).toStrictEqual([["A", "C"]]);
      });
    });

    describe("Numeric commas", () => {
      it("should preserve numeric commas while skipping empty cells", () => {
        const input = 'Name,,Amount\nJohn,,"$1,234.56"\n,Jane,$2,345.67';
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([
          ["Name", "Amount"],
          ["John", "$1,234.56"],
          ["Jane", "$2,345.67"],
        ]);
      });

      it("should handle empty cells between numeric values", () => {
        const input = "A,B,C\n1,234.56,,9,876.54\n,$5,678.90,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([
          ["A", "B", "C"],
          ["1,234.56", "9,876.54"],
          ["$5,678.90"],
        ]);
      });
    });

    describe("Real-world scenarios", () => {
      it("should handle sparse spreadsheet data", () => {
        const input =
          "Name,,,Age,,,City\nAlice,,,30,,,\n,,,25,,,Boston\nCharlie,,,,,,,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([
          ["Name", "Age", "City"],
          ["Alice", "30"],
          ["25", "Boston"],
          ["Charlie"],
        ]);
      });

      it("should handle financial data with gaps", () => {
        const input = "Q1,,Q2,,Q3\n$1,234.56,,$2,345.67,\n,,$3,456.78,,";
        const result = parse(input, { skipEmptyCells: true });

        expect(result).toStrictEqual([
          ["Q1", "Q2", "Q3"],
          ["$1,234.56", "$2,345.67"],
          ["$3,456.78"],
        ]);
      });

      it("should clean up messy CSV export", () => {
        const input =
          "Product,,Price,,Stock,,\nWidget,,$1,234.56,,100,,\n,,Gadget,,$2,345.67,,50";
        const result = parse(input, {
          skipEmptyCells: true,
          skipEmptyRows: true,
        });

        expect(result).toStrictEqual([
          ["Product", "Price", "Stock"],
          ["Widget", "$1,234.56", "100"],
          ["Gadget", "$2,345.67", "50"],
        ]);
      });
    });

    describe("All options combined", () => {
      it("should work with emptyValue, skipEmptyCells, skipEmptyRows, trim", () => {
        const input = "  A  ,,  C  \n\n  ,,  \n  D  ,  E  ,";
        const result = parse(input, {
          emptyValue: "N/A",
          skipEmptyCells: true,
          skipEmptyRows: true,
          trim: true,
        });

        expect(result).toStrictEqual([
          ["A", "C"],
          ["D", "E"],
        ]);
      });

      it("should work with skipEmptyCells, padRows (skipEmptyCells wins), skipEmptyRows", () => {
        const input = "A,B,C\n,,\nD,,E\n\nF";
        const result = parse(input, {
          padRows: true,
          skipEmptyCells: true,
          skipEmptyRows: true,
        });

        expect(result).toStrictEqual([["A", "B", "C"], ["D", "E"], ["F"]]);
      });
    });

    describe("Cross-format consistency", () => {
      it("should skip empty cells consistently in tab and CSV format", () => {
        const tabInput = "A\t\tC\n\tB\t";
        const csvInput = "A,,C\n,B,";

        const tabResult = parse(tabInput, { skipEmptyCells: true });
        const csvResult = parse(csvInput, { skipEmptyCells: true });

        expect(tabResult).toStrictEqual(csvResult);
        expect(tabResult).toStrictEqual([["A", "C"], ["B"]]);
      });

      it("should handle all options consistently across formats", () => {
        const tabInput = "A\t\tC\n\n  D  \t  E  \t";
        const csvInput = "A,,C\n\n  D  ,  E  ,";

        const options = {
          emptyValue: "N/A" as const,
          skipEmptyCells: true,
          skipEmptyRows: true,
          trim: true,
        };
        const tabResult = parse(tabInput, options);
        const csvResult = parse(csvInput, options);

        expect(tabResult).toStrictEqual(csvResult);
        expect(tabResult).toStrictEqual([
          ["A", "C"],
          ["D", "E"],
        ]);
      });
    });
  });
});
