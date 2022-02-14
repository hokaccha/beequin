module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.(ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsconfig: "src/main/tsconfig.json",
    },
  },
};
