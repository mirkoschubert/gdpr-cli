#!/usr/bin/env node --harmony

'use strict'

const app = require('commander');
const Tasks = require('./lib/tasks');
const UI = require('./lib/ui');

const tasks = new Tasks(); // initialize the task runner
const ui = new UI(); // initialize the UI

app
  .version(require('./package.json').version, '-v, --version');

app
  .command('scan [url]')
  .alias('s')
  .description('Scans an url')
  .option('-f, --fonts', 'checks if any font is loading externally')
  .option('-p, --prefetching', 'checks for DNS prefetching')
  .option('-r, --recursive', 'tries to follow links to check every internal site')
  .option('-V, --verbose', 'shows you every single step')
  .option('-S, --silent', 'shuts up')
  .action((url, options) => {
    console.log(options);
    if (options.verbose) ui.set('verbose');
    if (options.silent) ui.set('silent');

  });

app.parse(process.argv);
console.log(app.args.length);
if (!app.args.length) app.help();