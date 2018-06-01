'use strict';

class JSParser {

  constructor(js) {
    this.js = js;
  }

  /**
   * Checks if the traditional Google Analytics snippet is installed
   * @class JSParser
   */
  hasGoogleAnalytics() {
    let hasAnalytics = 'none';
    // Check for standard snippet, Example: freesendeern.de
    this.js.inline.forEach(js => {
      if (js.match(/google\-analytics\.com\/analytics\.js/) !== null) hasAnalytics = 'standard';
    });
    // Check for alternative asynchronous snippet, Example: 
    /* this.js.forEach(js => {
      if (js.url.href.match(/google\-analytics\.com\/analytics\.js/) !== null) hasAnalytics = 'alt';
    }); */
    return hasAnalytics;
  }


  /**
   * Reads Property ID and Features of Google Analytics
   * @class JSParser
   */
  getGoogleAnalyticsFeatures() {

    let entry = {};

    if (this.hasGoogleAnalytics() !== 'none') {
      this.js.inline.forEach(js => {
        const config = js.match(/(\(\'create)(.*)(\))/);
        if (config !== null) {
          entry.property_id = config.input.match(/UA\-[0-9]*\-[0-9]/)[0];
          entry.anonymize_ip = config.input.indexOf('\'anonymizeIp\', true') !== -1;
          entry.force_ssl = config.input.indexOf('\'forceSSL\', true') !== -1;
        }
      });
      return entry;
    } else return;
  }


  /**
   * Checks if the Google Tag Manager is installed
   * @class JSParser
   */
  hasGoogleTagManager() {
    // Example desireekeunecke.com
    let gtag = false;
    this.js.forEach(js => {
      if (js.url.href.match(/googletagmanager\.com\/gtag/) !== null) gtag = true;
    });
    return gtag;
  }


  /**
   * Reads Property ID and Features of Google Tag Manager
   * @class JSParser
   */
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

  /**
   * Checks if the Matomo/ Piwik analytics tool is installed
   * @class JSParser
   */
  hasPiwik() {
    // Example riamarleen.de
    let pw = false;
    this.js.inline.forEach(js => {
      if (js.match(/u\+\'piwik.php\'/) !== null) pw = true;
    });
    return pw;
  }

  /**
   * Reads URL and additional features of Piwik
   */
  getPiwikFeatures() {
    let entry = {};
    if (this.hasPiwik()) {
      this.js.inline.forEach(js => {

        const config = js.match(/(_paq.push\()(.*)(\))/);
        if (config !== null) {
          entry.url = config.input.match(/(var\su\=[\"\'])(.*)([\"\'])/)[2];
          entry.site_id = config.input.match(/(_paq.push\(\[\'setSiteId\',\s\')(.*)(\'\]\))/)[2];
        }
      });
      return entry;
    } else return;
  }

  hasWordPressStats() {
    // Example sandratetznerfotodesign.com
    let ws = false;
    this.js.forEach(js => {
      if (js.url.href.indexOf('stats.wp.com') !== -1) ws = true;
    });
    return ws;
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


  hasBeacons() {
    // pixel.wp.com

  }

}

module.exports = JSParser;