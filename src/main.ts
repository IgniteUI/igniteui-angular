import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { hmrBootstrap } from './hmr';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import localeBb from '@angular/common/locales/bg';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeJa);
registerLocaleData(localeBb);

if (environment.production) {
    enableProdMode();
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

if (environment.hmr) {
    if (module['hot']) {
        hmrBootstrap(module, bootstrap);
    } else {
        console.error('HMR is not enabled for webpack-dev-server!');
        console.log('Are you using the --hmr flag for ng serve?');
    }
} else {
    bootstrap().catch(err => console.log(err));
}
