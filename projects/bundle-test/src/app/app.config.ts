import { ApplicationConfig } from '@angular/core';
import { NavigationError, provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // force failed routes to throw & fail the SSG part of the build
      withNavigationErrorHandler((e: NavigationError) => { throw e; })
    ),
    provideClientHydration()
  ]
};
