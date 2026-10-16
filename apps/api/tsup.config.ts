import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  noExternal: ["@formly"], // transpile packages starting with `@formly` and their dependencies
  splitting: false,
  bundle: true,
  outDir: "./dist",
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
