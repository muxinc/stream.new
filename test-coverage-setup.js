#!/usr/bin/env node

/**
 * Script to test the coverage setup
 * This can be run to verify coverage configuration is working
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Coverage Setup...\n');

try {
  // Check if Jest is available
  console.log('1. Checking Jest installation...');
  try {
    execSync('npx jest --version', { stdio: 'ignore' });
    console.log('   ✅ Jest is available');
  } catch (error) {
    console.log('   ❌ Jest not found - run npm install');
    process.exit(1);
  }

  // Check Jest configuration
  console.log('2. Checking Jest configuration...');
  const jestConfigPath = path.join(__dirname, 'jest.config.js');
  if (fs.existsSync(jestConfigPath)) {
    const config = require('./jest.config.js');
    if (config.collectCoverageFrom && config.coverageThreshold) {
      console.log('   ✅ Jest coverage configuration found');
    } else {
      console.log('   ❌ Jest coverage configuration incomplete');
    }
  } else {
    console.log('   ❌ Jest configuration file not found');
  }

  // Check test files exist
  console.log('3. Checking for test files...');
  const testFiles = [
    'components/button.test.js',
    'lib/logger.test.ts',
    'pages/api/uploads/index.test.js',
  ];
  
  const existingTests = testFiles.filter(file => 
    fs.existsSync(path.join(__dirname, file))
  );
  
  if (existingTests.length > 0) {
    console.log(`   ✅ Found ${existingTests.length} test files`);
  } else {
    console.log('   ❌ No test files found');
  }

  // Run a quick test with coverage
  console.log('4. Running test with coverage (quick check)...');
  try {
    execSync('npx jest --coverage --passWithNoTests --silent', { 
      stdio: 'pipe',
      timeout: 30000 
    });
    console.log('   ✅ Coverage run completed successfully');
  } catch (error) {
    console.log('   ⚠️  Coverage run had issues (may be due to missing dependencies)');
    console.log('   Try running: npm install --legacy-peer-deps');
  }

  // Check coverage output
  console.log('5. Checking coverage output...');
  const coverageDir = path.join(__dirname, 'coverage');
  if (fs.existsSync(coverageDir)) {
    const htmlReport = path.join(coverageDir, 'lcov-report', 'index.html');
    if (fs.existsSync(htmlReport)) {
      console.log('   ✅ HTML coverage report generated');
      console.log(`   📊 Open: file://${htmlReport}`);
    } else {
      console.log('   ⚠️  HTML report not found');
    }
  } else {
    console.log('   ⚠️  Coverage directory not created');
  }

  console.log('\n🎉 Coverage setup verification complete!');
  console.log('\nNext steps:');
  console.log('1. Install dependencies: npm install --legacy-peer-deps');
  console.log('2. Run tests with coverage: npm run test:coverage');
  console.log('3. View coverage report: npm run coverage:open');
  
} catch (error) {
  console.error('❌ Error during coverage setup test:', error.message);
  process.exit(1);
}

// Clean up test file
if (process.argv.includes('--cleanup')) {
  fs.unlinkSync(__filename);
  console.log('🧹 Cleaned up test script');
}