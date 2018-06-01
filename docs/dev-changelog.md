# Changelog

### [v0.3.3] - 2018-06-01

* **BUGFIX:** When the site contains relative paths to CSS and JS files, those files won't load.
* **BUGFIX:** On certain sites with inaccurate code the `css` parser broke the script. I now provide an own parser.
* **FEATURE:** Adobe Typekit fonts can now be detected.

### [v0.3.2] - 2018-05-27

* **BUGFIX:** URL class couldn't be loaded globally at nodejs < 10
* **BUGFIX:** Inline JS and CSS couldn't be loaded when there are no external files

### [v0.3.1] - 2018-05-27

* Due to naming conventions in npmjs.com we changed our name from `gdpr-check` to `gdpr-cli`

### [v0.3.0] - 2018-05-27

* My first publicly available release. Beware! There may be **BUGS**. :smirk:
