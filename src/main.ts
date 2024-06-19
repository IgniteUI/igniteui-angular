import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import localeBb from '@angular/common/locales/bg';
import localeZh from '@angular/common/locales/zh';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeJa);
registerLocaleData(localeBb);
registerLocaleData(localeZh);

bootstrapApplication(AppComponent, appConfig).catch(err => console.log(err));
