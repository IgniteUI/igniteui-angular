// breaking change from beta6 https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-2
/////<reference path="../../../node_modules/angular2/typings/browser.d.ts"/>
"use strict";
var browser_1 = require('angular2/platform/browser');
var main_1 = require('./main');
// multi-app boot
function Start(app) {
    switch (app) {
        case "mini":
            browser_1.bootstrap(main_1.AppComponentMini);
            break;
        case "pin":
            browser_1.bootstrap(main_1.AppComponentPin);
            break;
        default:
            browser_1.bootstrap(main_1.AppComponent);
            break;
    }
}
exports.Start = Start;
//# sourceMappingURL=boot.js.map