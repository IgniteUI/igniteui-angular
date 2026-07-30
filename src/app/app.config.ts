import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { TestInterceptorClass } from './interceptor.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideIgniteIntl } from 'igniteui-angular/core';

export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TestInterceptorClass,
            multi: true
        },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi(), withFetch()),
        provideClientHydration(withNoIncrementalHydration()),
        provideRouter(appRoutes),
        provideIgniteIntl()
    ]
};
