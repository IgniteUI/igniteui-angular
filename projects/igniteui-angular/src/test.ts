// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { registerLocaleData } from '@angular/common';


import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';

declare const require: any;

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeJa);

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
