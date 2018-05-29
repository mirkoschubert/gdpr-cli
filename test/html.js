'use strict';

const test = require('ava');
const chalk = require('chalk');
const Tasks = require('../lib/tasks');

console.log = function () {} // suppress all logs

const sites = {
  'small static site': 'mirkoschubert.de',
  'wordpress site': 'freesendeern.de'
}

for (let site in sites) {
  const tasks = new Tasks(sites[site]);
  tasks.new('html');
  tasks.new('css');
  tasks.new('js');
  tasks.prepareTasks();

  test(chalk.yellow('get HTML code') + ' off of a ' + site, t => {
    return tasks.normalizeURL().then(() => tasks.processHTML()).then(res => {
      t.not(typeof tasks.data.html.headers, 'undefined');
      t.not(typeof tasks.data.html.content, 'undefined');
      t.not(tasks.data.html.content, '');
    });
  });

  test(chalk.yellow('parse CSS and JS files') + ' of a ' + site, t => {
    return tasks.normalizeURL().then(() => tasks.processHTML()).then(res => {
      t.not(typeof tasks.data.html.content, 'undefined');
      t.not(typeof tasks.data.css, 'undefined');
    });
  });

}