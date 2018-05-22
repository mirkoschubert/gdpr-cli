'use strict';

class JSParser {

  constructor(js) {
    this.js = js;
  }

  hasGoogleAnalytics() {
    let hasAnalytics = 'none';
    // Check for standard snippet, Example: freesendeern.de
    this.js.inline.forEach(js => {
      if (js.match(/google\-analytics\.com\/analytics\.js/) !== null) hasAnalytics = 'standard';
    });
    // Check for alternative asynchronous snippet, Example: 
    /* this.js.forEach(js => {
      if (js.url.match(/google\-analytics\.com\/analytics\.js/) !== null) hasAnalytics = 'alt';
    }); */
    return hasAnalytics;
  }


  getGoogleAnalyticsFeatures() {

    let entry = {};

    if (this.hasGoogleAnalytics() !== 'none') {
      this.js.inline.forEach(js => {
        const config = js.match(/(ga\(\'create)(.*)(\))/);
        if (config !== null) {
          entry.property_id = config.input.match(/UA\-[0-9]*\-[0-9]/)[0];
          entry.anonymize_ip = config.input.indexOf('\'anonymizeIp\', true') !== -1;
          entry.force_ssl = config.input.indexOf('\'forceSSL\', true') !== -1;
          console.log(config);
        }
      });
      return entry;
    } else return;
  }


  hasGoogleTagManager() {
    // Example desireekeunecke.com
    let gtag = false;
    this.js.forEach(js => {
      if (js.url.match(/googletagmanager\.com\/gtag/) !== null) gtag = true;
    });
    return gtag;
  }


  getGoogleTagManagerFeatures() {

    let entry = {};

    if (this.hasGoogleTagManager()) {
      this.js.inline.forEach(js => {

        const config = js.match(/(gtag\(\'config\')(.*)(\))/);
        if (config !== null) {
          entry.property_id = config[0].match(/UA\-[0-9]*\-[0-9]/)[0];
          entry.anonymize_ip = config[0].indexOf('\'anonymize_ip\': true') !== -1;
        }
      });
      return entry;
    } else return;
  }

  hasPiwik() {
    // Example riamarleen.de

  }

  hasWordPressStats() {
    // Example sandratetznerfotodesign.com

  }

  hasJetpack() {
    // Example sandratetznerfotodesign.com

  }

  hasMailchimp() {
    // Example gemueseliebelei.com

  }

  hasGoogleAdsense() {
    // Example die-hausmutter.de
  }

}

module.exports = JSParser;