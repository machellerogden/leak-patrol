#!/usr/bin/env node
const path = require('path');
const args = process.argv.slice(2).reduce((a, v) => (a.push(v), a), [ '-r', path.join(__dirname, '../index.js') ]);
require('child_process').spawn('node', args).stderr.pipe(process.stdout);
