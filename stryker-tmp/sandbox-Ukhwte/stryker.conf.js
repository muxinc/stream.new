/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
// @ts-nocheck

module.exports = {
  packageManager: 'npm',
  reporters: ['clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'off',
  
  jest: {
    projectType: 'custom',
    configFile: 'jest.config.js',
    enableFindRelatedTests: true,
  },
  
  mutate: [
    'lib/moderation-action.ts'
  ],
  
  concurrency: 1,
  tempDirName: 'stryker-tmp',
  cleanTempDir: true,
  
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  
  timeoutMS: 30000,
  timeoutFactor: 1.5,
};