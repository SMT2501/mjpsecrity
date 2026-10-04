'use strict';

// Cloud Function entry point — exports the Express app as an HTTPS function.
const functions = require('firebase-functions');
const app = require('./app');

exports.app = functions.https.onRequest(app);
