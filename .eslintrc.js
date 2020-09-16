module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['next.config.js'],
  globals: {
    document: true,
    window: true,
    graphql: true,
    fetch: true,
  },
  env: {
    jest: true,
  },
  extends: 'eslint-config-airbnb',
  rules: {
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'max-len': 0,
    'object-curly-newline': ['error', { consistent: true }],
    'react/destructuring-assignment': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/no-multi-comp': 0,
    'react/no-unescaped-entities': 0,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-props-no-spreading': 0,
    'space-before-function-paren': ['error', 'always'],
    'jsx-a11y/media-has-caption': 0,
    'import/prefer-default-export': 0,
  },
};
