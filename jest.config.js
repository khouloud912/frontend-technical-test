const nextJest = require('next/jest')

// Date formatting tests must not depend on the machine's time zone
process.env.TZ = 'UTC'

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/jest/setupFilesAfterEnv.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(s?css)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|pdf|svg|avif)$':
      '<rootDir>/jest/moduleMapper/fileMock.js',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/server/**', '!src/types/**'],
}

module.exports = createJestConfig(customJestConfig)
