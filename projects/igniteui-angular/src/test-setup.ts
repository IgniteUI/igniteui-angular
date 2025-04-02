import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';
import '../test.css';

import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { getTestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

getTestBed().initTestEnvironment(
    [BrowserDynamicTestingModule, NoopAnimationsModule],
    platformBrowserDynamicTesting(),
);
