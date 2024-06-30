const Sentry = require('@sentry/node');
const express = require('express');

require('dotenv').config();

const app = express();

const { SENTRY_DSN, ENV } = process.env;

Sentry.init({
	environment: ENV,
	dsn: SENTRY_DSN,
	integrations: [
		Sentry.httpIntegration({ tracing: true }),
		Sentry.expressIntegration({ app })
	],
	tracesSampleRate: 1.0
});

module.exports = Sentry;
