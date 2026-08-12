export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(t|j)sx?$": "<rootDir>/tests/esbuildTransformer.cjs",
  },
};
