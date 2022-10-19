// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'core-js/es/reflect';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { registerLocaleData } from '@angular/common';


import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeJa);

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
