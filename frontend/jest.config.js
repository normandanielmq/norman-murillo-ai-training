const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next/link$': '<rootDir>/src/__mocks__/next-link.tsx',
    '^next/navigation$': '<rootDir>/src/__mocks__/next-navigation.ts',
  },
};

module.exports = createJestConfig(config);
