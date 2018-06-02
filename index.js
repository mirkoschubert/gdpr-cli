#!/usr/bin/env node

'use strict'

const app = require('commander');
const chalk = require('chalk');
const Tasks = require('./lib/tasks');
const UI = require('./lib/ui');


const ui = new UI(); // initialize the UI

app
  .version(require('./package.json').version, '-V, --version')
  .option('-v, --verbose', 'shows you every single step')
  .option('-m, --mute', 'shows only the results of the analysis');

app
  .command('scan [url]')
  .alias('s')
  .description('Scans an url')
  .option('-f, --fonts', 'checks if any font is loading externally', true)
  .option('-s, --ssl', 'checks for SSL certificate', true)
  .option('-p, --prefetching', 'checks for DNS prefetching')
  .option('-a, --analytics', 'checks for Google Analytics & Piwik')
  .option('-c, --cdn', 'checks for Content Delivery Networks')
  //.option('-r, --recursive', 'tries to follow links to check every internal site', false)
  .action((url, args) => {
    // Error Handling
    if (typeof url === 'undefined') {
      ui.error('\nYou have to set an URL.\n', false);
      process.exit(0);
    }
    if (url.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/) === null) {
      ui.error('\nYou have to set a valid URL.', false);
      ui.info(chalk.dim('e.g. https://example.com or example.com\n'));
      process.exit(0);
    }
    if (args.parent.verbose && args.parent.mute) {
      ui.error('\nYou have to choose between silent or verbose mode!\n', false);
      process.exit(0);
    }

    if (args.parent.verbose) ui.set('verbose');
    if (args.parent.mute) ui.set('silent');

    // initialize the task runner
    const tasks = new Tasks(url, ui);

    if (args.ssl) tasks.new('ssl');
    if (args.fonts) tasks.new('fonts');
    if (args.prefetching) tasks.new('prefetching');
    if (args.analytics) tasks.new('analytics');
    if (args.cdn) tasks.new('cdn');

    tasks.run();
  });

app
  .command('help [command]')
  .description('shows the help for a specific command')
  .action(command => {
    if (!command) {
      app.help();
    } else {
      // specific help
      //app.help(command);
    }
  });

app.parse(process.argv);

//if (!app.args.length) app.help();