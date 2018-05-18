#!/usr/bin/env node --harmony

'use strict'

const app = require('commander');
const tasks = require('./lib/tasks');
const Parser = require('./lib/parser');



app
  .version(require('./package.json').version);

app
  .command('scan [url]')
  .description('Scans an url')
  .action(url => {
    tasks.run(url);
  });

app.parse(process.argv);
if (app.args.length === 0) app.help();