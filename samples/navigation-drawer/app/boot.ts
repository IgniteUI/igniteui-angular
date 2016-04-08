// breaking change from beta6 https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-2
/////<reference path="../../../node_modules/angular2/typings/browser.d.ts"/>

import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent, AppComponentPin, AppComponentMini} from './main'

// multi-app boot
export function Start(app: string) {
    switch (app) {
        case "mini":
            bootstrap(AppComponentMini);
            break;
        case "pin":
            bootstrap(AppComponentPin);
            break;
        default:
            bootstrap(AppComponent);
            break;
    }
}