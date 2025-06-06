# Code Coverage Guide

This project uses Jest's built-in code coverage functionality to measure and track test coverage across the codebase.

## 📊 Coverage Metrics

### Coverage Types
- **Lines**: Percentage of executable lines covered by tests
- **Functions**: Percentage of functions called by tests  
- **Branches**: Percentage of if/else branches executed
- **Statements**: Percentage of statements executed

### Current Thresholds
- **Global Minimums**: 80% lines, 75% functions, 70% branches, 80% statements
- **Critical Modules** (moderation): 90% lines, 90% functions, 85% branches, 90% statements
- **API Routes**: 85% lines, 85% functions, 80% branches, 85% statements

## 🚀 Running Coverage

### Basic Coverage
```bash
# Run tests with coverage report
npm run test:coverage

# Run coverage in watch mode
npm run test:coverage:watch

# Run coverage for CI/CD (no watch, no interactive)
npm run test:coverage:ci
```

### Viewing Reports
```bash
# Open HTML report in browser (macOS)
npm run coverage:open

# Serve HTML report on localhost:8080
npm run coverage:serve
```

## 📁 Coverage Output

Coverage reports are generated in multiple formats:

```
coverage/
├── lcov-report/           # Interactive HTML report
│   ├── index.html        # Main coverage dashboard
│   ├── components/       # Component coverage details
│   ├── lib/             # Library coverage details
│   └── pages/           # Page coverage details
├── coverage-final.json   # Raw coverage data
├── lcov.info            # LCOV format (for CI/CD)
└── clover.xml           # Clover format (for some CI tools)
```

## 🎯 Coverage Features

### Included in Coverage
- ✅ React components (`components/**`)
- ✅ Library utilities (`lib/**`)
- ✅ API routes (`pages/api/**`)
- ✅ Utility functions (`util/**`)
- ✅ Custom pages (`pages/**`)

### Excluded from Coverage
- ❌ Test files (`*.test.js`, `*.spec.js`)
- ❌ Test utilities (`test/`, `__tests__/`)
- ❌ Type definitions (`*.d.ts`)
- ❌ Configuration files (`*.config.js`)
- ❌ Next.js internals (`_app.tsx`, `_document.tsx`)
- ❌ Build artifacts (`.next/`, `node_modules/`)

## 📈 Coverage Reports

### Console Output
When running tests with coverage, you'll see a summary like:
```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   85.2  |    78.5  |   82.1  |   85.2  |
 components|   88.9  |    81.2  |   85.7  |   88.9  |
 lib      |   91.3  |    85.1  |   89.2  |   91.3  |
 pages    |   76.8  |    69.3  |   73.5  |   76.8  |
----------|---------|----------|---------|---------|-------------------
```

### HTML Report Features
- 📊 **Visual Coverage**: Color-coded line-by-line coverage
- 🔍 **Drill-down**: Click through directories and files
- 📋 **Sorting**: Sort by coverage percentage or file name
- 🎯 **Uncovered Lines**: Clearly highlighted missed lines
- 📱 **Responsive**: Works on desktop and mobile

## ⚙️ Configuration

### Jest Configuration
Coverage is configured in `jest.config.js`:

```javascript
{
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    // ... more patterns
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    }
  }
}
```

### Threshold Enforcement
Tests will **fail** if coverage falls below configured thresholds:
- Helps maintain code quality
- Prevents coverage regression
- Encourages comprehensive testing

## 🔧 Integration

### CI/CD Integration
For continuous integration, use:
```bash
npm run test:coverage:ci
```

This command:
- Runs without watch mode
- Outputs LCOV format for CI tools
- Fails if thresholds aren't met
- Works well with GitHub Actions, Jenkins, etc.

### Coverage Badges
Use the `lcov.info` file to generate coverage badges for your README:
- Codecov
- Coveralls
- Shields.io

### IDE Integration
Many IDEs can show coverage inline:
- VS Code: Coverage Gutters extension
- WebStorm: Built-in coverage display
- Vim: vim-coverage plugin

## 📚 Best Practices

### Writing Testable Code
- ✅ Keep functions small and focused
- ✅ Avoid deep nesting
- ✅ Use dependency injection
- ✅ Separate pure functions from side effects

### Improving Coverage
- 🎯 **Focus on untested branches**: if/else, switch cases
- 🔄 **Test error paths**: try/catch blocks, API failures
- 📋 **Test edge cases**: empty arrays, null values, boundary conditions
- 🧩 **Component states**: loading, error, success states

### Coverage Goals
- 🎯 **New code**: Aim for >90% coverage
- 🛡️ **Critical paths**: 100% coverage for security/payment features
- 📈 **Incremental improvement**: Gradually increase legacy code coverage
- ⚖️ **Balance**: Don't sacrifice test quality for coverage percentage

## 🚨 Common Issues

### Low Coverage Warnings
If you see coverage below thresholds:
1. Run `npm run coverage:open` to see detailed report
2. Identify untested lines/branches
3. Add targeted tests for missed scenarios
4. Consider if some code should be excluded

### Coverage Drops
If coverage suddenly drops:
- New code added without tests
- Tests deleted or commented out
- Configuration changes excluding files
- Dependencies updated affecting coverage calculation

### Performance Impact
Coverage collection adds overhead:
- Use `npm test` for fast development
- Use `npm run test:coverage` when needed
- Coverage in CI is usually acceptable trade-off

## 📊 Monitoring Coverage

### Regular Checks
- ✅ Run coverage before major releases
- ✅ Monitor coverage trends over time
- ✅ Review coverage in code reviews
- ✅ Set up coverage notifications

### Coverage Trends
Track coverage over time:
- Aim for steady improvement
- Investigate sudden drops
- Celebrate coverage milestones
- Use coverage as code quality metric

Remember: **Coverage is a tool, not a goal**. High coverage with poor tests is less valuable than lower coverage with high-quality, meaningful tests.