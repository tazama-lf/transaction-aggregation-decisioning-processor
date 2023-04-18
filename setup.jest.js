/* eslint-disable no-undef */

const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// Use mock redis instead of actual in jest
jest.mock('redis', () => jest.requireActual('redis-mock'));
