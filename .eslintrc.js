module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  ignorePatterns: ['next.config.js'],
  globals: {
    document: true,
    window: true,
    fetch: true,
    module: true,
    console: true,
    process: true
  },
  env: {
    jest: true,
  },
  extends: [
    'eslint:recommended', // eslint default rules
    'plugin:@typescript-eslint/eslint-recommended', // eslint TypeScript rules (github.com/typescript-eslint/typescript-eslint)
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended', // eslint react rules (github.com/yannickcr/eslint-plugin-react)
    'plugin:jsx-a11y/recommended', // accessibility plugin
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'import/prefer-default-export': 'off',
    'semi': 'warn',
    "react/no-unknown-property": [
      2,
      {
        "ignore": [
          "jsx",
          "global"
        ]
      }
    ]
  },
};
