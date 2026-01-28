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

// Initialize the Angular testing environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
