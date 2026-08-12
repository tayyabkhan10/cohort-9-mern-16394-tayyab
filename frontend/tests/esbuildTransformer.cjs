const esbuild = require("esbuild");

module.exports = {
  process(sourceText, sourcePath) {
    const loader = sourcePath.endsWith(".tsx")
      ? "tsx"
      : sourcePath.endsWith(".ts")
      ? "ts"
      : "jsx";

    const result = esbuild.transformSync(sourceText, {
      loader,
      format: "cjs",
      target: "es2020",
      jsx: "automatic",
      sourcemap: "inline",
      sourcefile: sourcePath,
    });

    return { code: result.code };
  },
};
