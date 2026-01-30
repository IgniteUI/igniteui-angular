import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

import { expect } from 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveClass(className: string): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveClass(className: string): any;
  }
}

expect.extend({
  toHaveClass(received: Element, className: string) {
    const pass = received.classList.contains(className);
    return {
      pass,
      message: () => 
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`
    };
  }
});

// Wait for Zone.js to be available
if (typeof Zone === 'undefined') {
  throw new Error('Zone.js is required but not loaded');
}

// Initialize the Angular testing environment only if not already initialized
const testBed = getTestBed();
if (!(testBed as any).platform) {
  testBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    { teardown: { destroyAfterEach: true } }
  );
}
