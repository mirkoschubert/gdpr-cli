'use strict';

const test = require('ava');
const chalk = require('chalk');
const Tasks = require('../lib/tasks');

console.log = function () {} // suppress all logs

const sites = {
  'url with the wrong protocol': {
    url: 'http://mirkoschubert.de',
    expected: 'https://mirkoschubert.de/'
  },
  'url with the right protocol': {
    url: 'https://mirkoschubert.de',
    expected: 'https://mirkoschubert.de/'
  },
  'url without any specific protocol': {
    url: '//mirkoschubert.de',
    expected: 'https://mirkoschubert.de/'
  },
  'url without any protocol': {
    url: 'mirkoschubert.de',
    expected: 'https://mirkoschubert.de/'
  },
  /*   'non existant url': {
      url: 'http://aslkfjhans.com',
      expected: ''
    },
    'google.de (known issue)': {
      url: 'https://google.de',
      expected: 'https://www.google.de/'
    } */
};


for (let site in sites) {

  test(chalk.yellow('normalize ') + site, t => {
    const tasks = new Tasks(sites[site].url);

    t.is(tasks.tasks[0], 'normalize');
    return tasks.normalizeURL().then(() => {
      t.is(tasks.data.html.url.href, sites[site].expected);
    });
  });
}