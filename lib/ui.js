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
    // make sure that only accepted modes are
    console.log(['silent', 'normal', 'verbose'].some(val => mode === val));
  }

  statusMessage() {

  }
}

module.exports = UI;