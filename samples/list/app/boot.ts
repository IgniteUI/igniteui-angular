// breaking change from beta6 https://github.com/angular/angular/blob/master/CHANGELOG.md#breaking-changes-2
/////<reference path="../../../node_modules/angular2/typings/browser.d.ts"/>

import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './main'

// multi-app boot
export function Start() {
    bootstrap(AppComponent);
}