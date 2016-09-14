// breaking change from beta6 https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-2
/////<reference path="../../../node_modules/@angular/typings/browser.d.ts"/>
"use strict";
const platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
const main_1 = require('./main');
// multi-app boot
function Start(app) {
    switch (app) {
        case "mini":
            platform_browser_dynamic_1.bootstrap(main_1.AppComponentMini);
            break;
        case "pin":
            platform_browser_dynamic_1.bootstrap(main_1.AppComponentPin);
            break;
        default:
            platform_browser_dynamic_1.bootstrap(main_1.AppComponent);
            break;
    }
}
exports.Start = Start;

//# sourceMappingURL=boot.js.map
