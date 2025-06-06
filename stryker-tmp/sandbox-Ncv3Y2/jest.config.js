// @ts-nocheck
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  
  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    // Include source files
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'util/**/*.{js,jsx,ts,tsx}',
    
    // Exclude files that don't need coverage
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/test/**',
    '!**/tests/**',
    '!**/__tests__/**',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/*.spec.{js,jsx,ts,tsx}',
    '!pages/_app.tsx',
    '!pages/_document.tsx',
    '!pages/_middleware.tsx',
    '!next.config.js',
    '!jest.config.js',
    '!style-vars.js',
  ],
  
  // Coverage output configuration
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',        // Console output
    'text-summary', // Brief summary
    'html',        // Interactive HTML report
    'lcov',        // For CI/CD integration
    'json',        // Machine-readable format
  ],
  
  // Coverage thresholds (fail if below these percentages)
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70,
    },
  },
  
  // Projects for different test environments
  projects: [
    {
      displayName: 'Components & Browser Code',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/components/**/*.(test|spec).{js,jsx,ts,tsx}',
        '<rootDir>/util/**/*.(test|spec).{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
      setupFiles: ['<rootDir>/test/jest.setup.js'],
    },
    {
      displayName: 'API Routes & Server Code',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/pages/api/**/*.(test|spec).{js,jsx,ts,tsx}',
        '<rootDir>/lib/**/*.(test|spec).{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
    },
  ],
  
  // Module name mapping for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(@mux|hls.js)/)',
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};
