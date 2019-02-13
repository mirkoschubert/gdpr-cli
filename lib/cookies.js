/*!
 * cookies (adaptated from server-side cookies from https://github.com/pillarjs/cookies)
 * Copyright(c) 2014 Jed Schmidt, http://jed.is/
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * Copyright(c) 2018 Baptiste LARVOL-SIMON, http://www.e-glop.net/
 * MIT Licensed
 */

'use strict'

var deprecate = require('depd')('cookies')
var Keygrip = require('keygrip')
var cache = {}

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * RegExp to match Same-Site cookie attribute value.
 */

var sameSiteRegExp = /^(?:lax|strict)$/i

/**
 * @param cookies  array of arrays of cookies
 */
function Cookies(cookies){
  this.raw_cookies = cookies;
}

/**
 * @return Array
 **/
Cookies.prototype.fetchAll = function() {
  var cookies = [];
  
  if (!this.raw_cookies) return [];

  this.raw_cookies.forEach(cooks => {
    cooks.forEach(cook => {
      var data = cook.split(/\\{0}; /),
          name,
          attrs = [],

      name = data.shift().split('=');
      
      data.forEach(attr => {
        var dat = attr.split('=');
        attrs[dat[0]] = dat[1];
      });

      cookies.push(new Cookie(name[0], name[1], attrs));
    });
  });
  
  return cookies;
}

function Cookie(name, value, attrs) {
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument value is invalid');
  }

  value || (this.expires = new Date(0))

  this.name = name
  this.value = value || ""

  for (var name in attrs) {
    switch ( name ) {
      case 'secure':
        this[name] = true;
        break;
      case 'expires':
        this[name] = new Date(attrs[name]);
        break;
      default:
        this[name] = attrs[name];
    }
  }

  if (this.path && !fieldContentRegExp.test(this.path)) {
    throw new TypeError('option path is invalid');
  }

  if (this.domain && !fieldContentRegExp.test(this.domain)) {
    throw new TypeError('option domain is invalid');
  }

  if (this.sameSite && this.sameSite !== true && !sameSiteRegExp.test(this.sameSite)) {
    throw new TypeError('option sameSite is invalid')
  }
}

Cookie.prototype.path = "/";
Cookie.prototype.expires = undefined;
Cookie.prototype.domain = undefined;
Cookie.prototype.httpOnly = true;
Cookie.prototype.sameSite = false;
Cookie.prototype.secure = false;
Cookie.prototype.overwrite = false;

// back-compat so maxage mirrors maxAge
Object.defineProperty(Cookie.prototype, 'maxage', {
  configurable: true,
  enumerable: true,
  get: function () { return this.maxAge },
  set: function (val) { return this.maxAge = val }
});
deprecate.property(Cookie.prototype, 'maxage', '"maxage"; use "maxAge" instead')

function getPattern(name) {
  if (cache[name]) return cache[name]

  return cache[name] = new RegExp(
    "(?:^|;) *" +
    name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
    "=([^;]*)"
  )
}

module.exports = Cookies
