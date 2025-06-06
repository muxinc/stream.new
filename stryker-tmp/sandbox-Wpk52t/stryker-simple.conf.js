/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
// @ts-nocheck

module.exports = {
  packageManager: 'npm',
  reporters: ['clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'off', // Disable coverage analysis to avoid environment issues
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: true,
  },
  
  // Target specific file for testing
  mutate: [
    'lib/player-page-utils.ts'
  ],
  
  // Performance settings
  concurrency: 1,
  tempDirName: 'stryker-tmp',
  cleanTempDir: true,
  
  // Set thresholds for mutation score
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  
  // Timeout settings
  timeoutMS: 30000,
  timeoutFactor: 1.5,
};