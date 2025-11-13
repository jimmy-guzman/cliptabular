import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["cjs", "esm"],
  minify: true,
  publint: true,
});
