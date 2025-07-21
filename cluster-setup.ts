// SPDX-License-Identifier: Apache-2.0
process.env.MAX_CPU = '1';
process.env.STARTUP_TYPE = 'nats';
process.env.FUNCTION_NAME = 'tadp';
process.env.SUPPRESS_ALERTS = 'true';
process.env.PRODUCER_STREAM = 'stream';

process.env.APM_ACTIVE = 'false';
process.env.APM_SERVICE_NAME = 'test';
process.env.APM_URL = 'test';
