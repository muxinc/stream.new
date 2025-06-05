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
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for critical modules
    './lib/moderation-*.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './pages/api/**/*.{js,ts}': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Test environment
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Module name mapping for aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  
  // Setup files
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(@mux|hls.js)/)',
  ],
  
  // Verbose output for detailed test results
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};
