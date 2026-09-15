import { ApplicationConfig } from '@angular/core';
import { NavigationError, provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // force failed routes to throw & fail the SSG part of the build
      withNavigationErrorHandler((e: NavigationError) => { throw e; })
    ),
    provideAnimations(),
    provideClientHydration(withNoIncrementalHydration())
  ]
};
