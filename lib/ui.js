'use strict';

const chalk = require('chalk');
const moment = require('moment');

class UI {

  constructor() {
    this.mode = 'normal';
  }

  /**
   * Sets the Mode (silent|normal|verbose)
   * @param {string} mode 
   */
  set(mode) {
    this.mode = mode || 'normal';
  }

  message(msg, state, showTime) {

    if (typeof msg !== 'string' && typeof msg !== 'object') return;
    if (typeof msg === 'object' && msg[this.mode] === '') return;

    const _message = (typeof msg === 'object') ? msg[this.mode] : msg;
    const _state = (state && state !== '') ? chalk.dim('[' + state.toUpperCase() + ']') : '';
    const _time = (typeof showTime !== 'undefined' && showTime === false) ? '          ' : chalk.dim('[' + moment().format('HH:mm:ss') + ']');

    console.log(_time + ' ' + _message + ' ' + _state);
  }

  error(msg) {
    console.log(chalk.red(msg));
  }
}

module.exports = UI;