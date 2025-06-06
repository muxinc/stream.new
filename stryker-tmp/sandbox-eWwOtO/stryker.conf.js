/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
// @ts-nocheck

module.exports = {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],
  testRunner: 'jest',
  testRunnerNodeArgs: ['--max-old-space-size=4096'],
  coverageAnalysis: 'perTest',
  jest: {
    projectType: 'create-react-app',
    enableFindRelatedTests: true,
  },
  
  // Target the most important application code for mutation testing
  mutate: [
    // Core business logic - video upload and processing
    'pages/index.tsx',
    'pages/assets/[id].tsx',
    'pages/v/[id]/index.tsx',
    'pages/v/[id]/embed.tsx',
    
    // Critical components
    'components/player-page.tsx',
    'components/upload-page.tsx',
    'components/record-page.tsx',
    
    // Important utility functions
    'lib/player-page-utils.ts',
    'lib/moderation-*.ts',
    'lib/telemetry.ts',
    
    // API endpoints
    'pages/api/uploads/index.ts',
    'pages/api/assets/[id].ts',
    'pages/api/webhooks/mux.ts',
  ],
  
  // Exclude test files and build artifacts
  mutationLevelOptions: {
    excludedMutations: [
      // Reduce noise from less important mutations
      'StringLiteral',    // Don't mutate string constants
      'ArrayDeclaration', // Don't mutate array literals
      'ObjectLiteral',    // Don't mutate object literals
    ]
  },
  
  // Performance and reliability settings
  maxConcurrentTestRunners: 2,
  tempDirName: 'stryker-tmp',
  cleanTempDir: true,
  
  // Set thresholds for mutation score
  thresholds: {
    high: 80,
    low: 60,
    break: 50  // Fail if mutation score below 50%
  },
  
  // Timeout settings
  timeoutMS: 60000,
  timeoutFactor: 1.5,
  
  // Only run mutations where we have tests
  coverageAnalysis: 'perTest',
  
  // Dashboard reporter configuration (optional)
  dashboard: {
    project: 'stream.new',
    version: 'main',
    module: 'core'
  }
};