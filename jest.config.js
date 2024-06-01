module.exports = {
  // add some modules into transformIgnorePatterns. They are ESM-style modules; jest cannot handle it straightly so that babel-jest do.
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {tsconfig: "tsconfig.test.json"}],
    "^.+\\.js$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!chatgpt|p-timeout|quick-lru).+\\.js$"
  ],
  verbose: true
};
