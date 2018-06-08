'use strict';

class JSParser {

  constructor(js) {
    this.js = js;
  }


  /**
   * Reads Property ID and Features of Google Analytics
   * @class JSParser
   */
  getGoogleAnalyticsFeatures() {

    let entry = {};

    // TODO: more than one Snippet 

    this.js.inline.forEach(js => {
      const hasStandardGA = js.indexOf('google-analytics.com/analytics.js') !== -1 && js.match(/(\(\'create)(.*)(\))/) !== null;
      const hasLegacyGA = js.indexOf('google-analytics.com/ga.js') !== -1 && js.indexOf('_gaq.push') !== -1;
      if (hasStandardGA || hasLegacyGA) console.log(js);

      if (hasStandardGA) {
        entry.property_id = js.match(/UA\-[0-9]*\-[0-9]/)[0];
        entry.anonymize_ip = js.indexOf('\'anonymizeIp\', true') !== -1;
        entry.force_ssl = js.indexOf('\'forceSSL\', true') !== -1;
        entry.type = 'standard';
      } else if (hasLegacyGA) {
        entry.property_id = js.match(/UA\-[0-9]*\-[0-9]/)[0];
        entry.anonymize_ip = js.indexOf('_gat._anonymizeIp') !== -1;
        entry.force_ssl = js.indexOf('_gat._forceSSL') !== -1;
        entry.type = 'legacy';
      }
    });
    return (Object.keys(entry).length > 0) ? entry : undefined;
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