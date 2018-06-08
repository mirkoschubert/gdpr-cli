'use strict';

// INFO: Check feature 

/**
 * Checks if Google Analytics is installed
 * @returns boolean
 */
function hasGoogleAnalytics(js) {
  let ga = false;
  js.inline.forEach(el => {
    if (el.indexOf('google-analytics.com/analytics.js') !== -1 && el.match(/(\(\'create)(.*)(\))/) !== null) ga = true;
    if (el.indexOf('google-analytics.com/ga.js') !== -1 && el.indexOf('_gaq.push') !== -1) ga = true;
  });
  return ga;
}

/**
 * Checks if the Google Tag Manager is installed
 * @returns boolean
 */
function hasGoogleTagManager(js) {
  // Example desireekeunecke.com
  let gtag = false;
  js.forEach(el => {
    if (el.url.href.match(/googletagmanager\.com\/gtag/) !== null) gtag = true;
  });
  return gtag;
}


/**
 * Checks if the Matomo/ Piwik analytics tool is installed
 * @returns boolean
 */
function hasPiwik(js) {
  // Example riamarleen.de
  let pw = false;
  js.inline.forEach(el => {
    if (el.match(/u\+\'piwik.php\'/) !== null) pw = true;
  });
  return pw;
}


function hasWordPressStats(js) {
  // Example sandratetznerfotodesign.com
  let ws = false;
  js.forEach(el => {
    if (el.url.href.indexOf('stats.wp.com') !== -1) ws = true;
  });
  return ws;
}

// INFO: Details Functions


/**
 * Reads Property ID and Features of Google Analytics
 * @class JSParser
 */
function getGoogleAnalyticsDetails(js) {

  let entry = {};

  // TODO: more than one Snippet 

  js.inline.forEach(el => {
    const hasStandardGA = el.indexOf('google-analytics.com/analytics.js') !== -1 && el.match(/(\(\'create)(.*)(\))/) !== null;
    const hasLegacyGA = el.indexOf('google-analytics.com/ga.js') !== -1 && el.indexOf('_gaq.push') !== -1;
    //if (hasStandardGA || hasLegacyGA) console.log(el);

    if (hasStandardGA) {
      entry.property_id = el.match(/UA\-[0-9]*\-[0-9]/)[0];
      entry.anonymize_ip = el.indexOf('\'anonymizeIp\', true') !== -1;
      entry.force_ssl = el.indexOf('\'forceSSL\', true') !== -1;
      entry.type = 'standard';
    } else if (hasLegacyGA) {
      entry.property_id = el.match(/UA\-[0-9]*\-[0-9]/)[0];
      entry.anonymize_ip = el.indexOf('_gat._anonymizeIp') !== -1;
      entry.force_ssl = el.indexOf('_gat._forceSSL') !== -1;
      entry.type = 'legacy';
    }
  });
  return (Object.keys(entry).length > 0) ? entry : undefined;
}


/**
 * Reads Property ID and Features of Google Tag Manager
 * @class JSParser
 */
function getGoogleTagManagerDetails(js) {

  let entry = {};

  if (hasGoogleTagManager(js)) {
    js.inline.forEach(el => {

      const config = el.match(/(gtag\(\'config\')(.*)(\))/);
      if (config !== null) {
        entry.property_id = config[0].match(/UA\-[0-9]*\-[0-9]/)[0];
        entry.anonymize_ip = config[0].indexOf('\'anonymize_ip\': true') !== -1;
      }
    });
    return entry;
  } else return;
}


/**
 * Reads URL and additional features of Piwik
 */
function getPiwikDetails(js) {
  let entry = {};
  if (hasPiwik(js)) {
    js.inline.forEach(el => {

      const config = el.match(/(_paq.push\()(.*)(\))/);
      if (config !== null) {
        entry.url = config.input.match(/(var\su\=[\"\'])(.*)([\"\'])/)[2];
        entry.site_id = config.input.match(/(_paq.push\(\[\'setSiteId\',\s\')(.*)(\'\]\))/)[2];
      }
    });
    return entry;
  } else return;
}


module.exports = {
  hasGoogleAnalytics,
  hasGoogleTagManager,
  hasPiwik,
  hasWordPressStats,
  getGoogleAnalyticsDetails,
  getGoogleTagManagerDetails,
  getPiwikDetails
};