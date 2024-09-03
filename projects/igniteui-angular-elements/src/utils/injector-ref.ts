import { createEnvironmentInjector, EnvironmentInjector, getPlatform, importProvidersFrom, provideZoneChangeDetection, ɵChangeDetectionScheduler, ɵChangeDetectionSchedulerImpl } from '@angular/core';
import { BrowserModule, platformBrowser } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ELEMENTS_TOKEN } from 'igniteui-angular/src/lib/core/utils';
import { IgxIconBroadcastService } from '../lib/icon.broadcast.service';

/**
 * Top-level await (TLA) both requires higher ES target and currently has only partial support in ES build
 * https://github.com/evanw/esbuild/issues/253 https://v8.dev/features/top-level-await
 * And even it fails to re-bundle produced files. Test app still break even when manually corrected
 * So leaving this out for future option once support is more broad/stable:
 */
// import { createApplication } from '@angular/platform-browser';
// const appRef = await createApplication();
// const injector = appRef.injector;


// The only actual async part of creating app are the initializers which we don't use/need
// Recreation below of the rest of the process in order to get a working env injector for Elements

// TODO: https://angular.dev/api/core/PlatformRef#onDestroy for Icon service?
const platformInjector = getPlatform()?.injector ?? platformBrowser().injector;

// createEnvironmentInjector is a public wrapper around EnvironmentNgModuleRefAdapter
// https://github.com/angular/angular/blob/969dadc8e2fad8ca9d892858bdadbe3abb13de95/packages/core/src/application/create_application.ts#L56C25-L56C54
const injector = createEnvironmentInjector([
     // TODO: -> provideExperimentalZonelessChangeDetection
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Required, but only provided internally by `provideExperimentalZonelessChangeDetection`, `bootstrapModuleFactory`
    // & `internalCreateApplication` (`bootstrapApplication`/`createApplication`), so no public API alternative:
    { provide: ɵChangeDetectionScheduler, useExisting: ɵChangeDetectionSchedulerImpl },
    importProvidersFrom(BrowserModule),
    // Elements specific:
    provideAnimations(),
    { provide: ELEMENTS_TOKEN, useValue: true },
    IgxIconBroadcastService
], platformInjector as EnvironmentInjector);

export { injector };
