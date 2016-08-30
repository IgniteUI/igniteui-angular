// breaking change from beta6 https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-2
/////<reference path="../../../node_modules/@angular/typings/browser.d.ts"/>
"use strict";
const platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
const main_1 = require('./main');
// multi-app boot
function Start() {
    platform_browser_dynamic_1.bootstrap(main_1.AppComponent);
}
exports.Start = Start;

//# sourceMappingURL=boot.js.map
