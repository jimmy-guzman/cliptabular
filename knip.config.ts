import type { KnipConfig } from "knip";

export default {
  ignore: ["**/*.spec-d.ts"],
  ignoreDependencies: [
    "gitzy",
    "@commitlint/config-conventional",
    "commitlint",
  ],
} satisfies KnipConfig;
