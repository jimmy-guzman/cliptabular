import { stringify } from "./stringify";

describe("stringify", () => {
  describe("default behavior", () => {
    it("should use tab delimiter by default", () => {
      const data = [
        ["A", "B", "C"],
        ["1", "2", "3"],
      ];

      expect(stringify(data)).toBe("A\tB\tC\n1\t2\t3");
    });

    it("should use LF line ending by default", () => {
      const data = [
        ["A", "B"],
        ["C", "D"],
      ];

      expect(stringify(data)).toBe("A\tB\nC\tD");
    });

    it("should treat null as empty by default", () => {
      const data = [["A", null, "C"]];

      expect(stringify(data)).toBe("A\t\tC");
    });

    it("should not treat undefined as empty by default (only null)", () => {
      const data = [["A", undefined, "C"]];

      expect(stringify(data)).toBe("A\tundefined\tC");
    });

    it("should not quote simple values", () => {
      const data = [["simple", "values", "123"]];

      expect(stringify(data)).toBe("simple\tvalues\t123");
    });

    it("should quote cells containing the delimiter", () => {
      const data = [["A\tB", "C"]];

      expect(stringify(data)).toBe('"A\tB"\tC');
    });

    it("should quote cells containing double quotes and escape them", () => {
      const data = [['Say "hello"', "world"]];

      expect(stringify(data)).toBe('"Say ""hello"""\tworld');
    });

    it("should quote cells containing newlines", () => {
      const data = [["Line1\nLine2", "B"]];

      expect(stringify(data)).toBe('"Line1\nLine2"\tB');
    });

    it("should handle empty array", () => {
      expect(stringify([])).toBe("");
    });

    it("should preserve zero, false, and empty string", () => {
      const data = [[0, false, ""]];

      expect(stringify(data, { delimiter: "," })).toBe("0,false,");
    });
  });

  describe("delimiter option", () => {
    it("should use comma delimiter", () => {
      const data = [
        ["A", "B", "C"],
        ["1", "2", "3"],
      ];

      expect(stringify(data, { delimiter: "," })).toBe("A,B,C\n1,2,3");
    });

    it("should use semicolon delimiter", () => {
      const data = [["A", "B"]];

      expect(stringify(data, { delimiter: ";" })).toBe("A;B");
    });

    it("should use pipe delimiter", () => {
      const data = [["A", "B"]];

      expect(stringify(data, { delimiter: "|" })).toBe("A|B");
    });

    it("should quote cells containing the specified delimiter", () => {
      const data = [["A,B", "C"]];

      expect(stringify(data, { delimiter: "," })).toBe('"A,B",C');
    });
  });

  describe("alwaysQuote option", () => {
    it("should quote all cells when true", () => {
      const data = [["A", "B", "C"]];

      expect(stringify(data, { alwaysQuote: true, delimiter: "," })).toBe(
        '"A","B","C"',
      );
    });

    it("should not quote simple values when false", () => {
      const data = [["A", "B", "C"]];

      expect(stringify(data, { alwaysQuote: false, delimiter: "," })).toBe(
        "A,B,C",
      );
    });
  });

  describe("lineEnding option", () => {
    it("should use CRLF when specified", () => {
      const data = [
        ["A", "B"],
        ["C", "D"],
      ];

      expect(stringify(data, { delimiter: ",", lineEnding: "\r\n" })).toBe(
        "A,B\r\nC,D",
      );
    });

    it("should use CR when specified", () => {
      const data = [
        ["A", "B"],
        ["C", "D"],
      ];

      expect(stringify(data, { delimiter: ",", lineEnding: "\r" })).toBe(
        "A,B\rC,D",
      );
    });

    it("should use LF when specified", () => {
      const data = [
        ["A", "B"],
        ["C", "D"],
      ];

      expect(stringify(data, { delimiter: ",", lineEnding: "\n" })).toBe(
        "A,B\nC,D",
      );
    });
  });

  describe("emptyValue option", () => {
    it("should treat custom value as empty", () => {
      const data = [["A", "EMPTY", "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: "EMPTY",
        }),
      ).toBe("A,,C");
    });

    it("should treat null as empty when explicitly set", () => {
      const data = [["A", null, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: null,
        }),
      ).toBe("A,,C");
    });

    it("should treat undefined as empty when set as emptyValue", () => {
      const data = [["A", undefined, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: undefined,
        }),
      ).toBe("A,,C");
    });

    it("should treat zero as empty when set as emptyValue", () => {
      const data = [["A", 0, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: 0,
        }),
      ).toBe("A,,C");
    });

    it("should treat false as empty when set as emptyValue", () => {
      const data = [["A", false, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: false,
        }),
      ).toBe("A,,C");
    });

    it("should treat empty string as empty when set as emptyValue", () => {
      const data = [["A", "", "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: "",
        }),
      ).toBe("A,,C");
    });
  });

  describe("emptyOutput option", () => {
    it("should use custom output for empty cells", () => {
      const data = [["A", null, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyOutput: "N/A",
          emptyValue: null,
        }),
      ).toBe("A,N/A,C");
    });

    it("should use dash for empty cells", () => {
      const data = [["A", null, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyOutput: "-",
          emptyValue: null,
        }),
      ).toBe("A,-,C");
    });

    it("should use empty string by default", () => {
      const data = [["A", null, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyValue: null,
        }),
      ).toBe("A,,C");
    });

    it("should quote emptyOutput if it contains delimiter", () => {
      const data = [["A", null, "C"]];

      expect(
        stringify(data, {
          delimiter: ",",
          emptyOutput: "N,A",
          emptyValue: null,
        }),
      ).toBe('A,"N,A",C');
    });
  });

  describe("round-trip with parser", () => {
    it("should round-trip with null as emptyValue", () => {
      const data = [
        ["A", null, "C"],
        ["D", "E", null],
      ];
      const result = stringify(data, {
        delimiter: ",",
        emptyValue: null,
      });

      expect(result).toBe("A,,C\nD,E,");
    });

    it("should round-trip with custom emptyValue", () => {
      const data = [
        ["A", "EMPTY", "C"],
        ["D", "E", "EMPTY"],
      ];
      const result = stringify(data, {
        delimiter: ",",
        emptyValue: "EMPTY",
      });

      expect(result).toBe("A,,C\nD,E,");
    });
  });
});
