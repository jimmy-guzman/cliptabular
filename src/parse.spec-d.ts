import { parse } from "./parse";

describe("parse emptyValue type inference", () => {
  test("should infer null as default empty value", () => {
    const result = parse("A,B\nC,D");

    expectTypeOf(result).toEqualTypeOf<(null | string)[][]>();
    assertType<(null | string)[][]>(result);
  });

  test("should infer string when emptyValue is empty string", () => {
    const result = parse("A,B\nC,D", { emptyValue: "" });

    expectTypeOf(result).toEqualTypeOf<string[][]>();
    assertType<string[][]>(result);
  });

  test("should infer undefined when emptyValue is undefined", () => {
    const result = parse("A,B\nC,D", { emptyValue: undefined });

    expectTypeOf(result).toEqualTypeOf<(string | undefined)[][]>();
    assertType<(string | undefined)[][]>(result);
  });

  test("should infer custom string literal type", () => {
    const result = parse("A,B\nC,D", { emptyValue: "N/A" });

    // String literal "N/A" | string simplifies to string
    expectTypeOf(result).toEqualTypeOf<string[][]>();
    assertType<string[][]>(result);
  });

  test("should infer number when emptyValue is number", () => {
    const result = parse("A,B\nC,D", { emptyValue: 0 });

    expectTypeOf(result).toEqualTypeOf<(number | string)[][]>();
    assertType<(number | string)[][]>(result);
  });

  test("should work with empty options object", () => {
    const result = parse("A,B\nC,D", {});

    expectTypeOf(result).toEqualTypeOf<(null | string)[][]>();
    assertType<(null | string)[][]>(result);
  });
});
