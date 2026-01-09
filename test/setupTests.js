/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom');
const dotenv = require('dotenv');
require('@mux/mux-node/shims/node');

dotenv.config({ path: '.env.test' });
