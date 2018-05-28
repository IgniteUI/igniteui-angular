/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '../di/injection_token';
/**
 * Provide this token to set the locale of your application.
 * It is used for i18n extraction, by i18n pipes (DatePipe, I18nPluralPipe, CurrencyPipe,
 * DecimalPipe and PercentPipe) and by ICU expressions.
 *
 * See the {\@linkDocs guide/i18n#setting-up-locale i18n guide} for more information.
 *
 * ### Example
 *
 * ```typescript
 * import { LOCALE_ID } from '\@angular/core';
 * import { platformBrowserDynamic } from '\@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * });
 * ```
 *
 * \@experimental i18n support is experimental.
 */
export const /** @type {?} */ LOCALE_ID = new InjectionToken('LocaleId');
/**
 * Use this token at bootstrap to provide the content of your translation file (`xtb`,
 * `xlf` or `xlf2`) when you want to translate your application in another language.
 *
 * See the {\@linkDocs guide/i18n#merge i18n guide} for more information.
 *
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS } from '\@angular/core';
 * import { platformBrowserDynamic } from '\@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * // content of your translation file
 * const translations = '....';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * });
 * ```
 *
 * \@experimental i18n support is experimental.
 */
export const /** @type {?} */ TRANSLATIONS = new InjectionToken('Translations');
/**
 * Provide this token at bootstrap to set the format of your {\@link TRANSLATIONS}: `xtb`,
 * `xlf` or `xlf2`.
 *
 * See the {\@linkDocs guide/i18n#merge i18n guide} for more information.
 *
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS_FORMAT } from '\@angular/core';
 * import { platformBrowserDynamic } from '\@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * });
 * ```
 *
 * \@experimental i18n support is experimental.
 */
export const /** @type {?} */ TRANSLATIONS_FORMAT = new InjectionToken('TranslationsFormat');
/** @enum {number} */
const MissingTranslationStrategy = {
    Error: 0,
    Warning: 1,
    Ignore: 2,
};
export { MissingTranslationStrategy };
MissingTranslationStrategy[MissingTranslationStrategy.Error] = "Error";
MissingTranslationStrategy[MissingTranslationStrategy.Warning] = "Warning";
MissingTranslationStrategy[MissingTranslationStrategy.Ignore] = "Ignore";

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaTE4bi90b2tlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QnJELE1BQU0sQ0FBQyx1QkFBTSxTQUFTLEdBQUcsSUFBSSxjQUFjLENBQVMsVUFBVSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCaEUsTUFBTSxDQUFDLHVCQUFNLFlBQVksR0FBRyxJQUFJLGNBQWMsQ0FBUyxjQUFjLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0J2RSxNQUFNLENBQUMsdUJBQU0sbUJBQW1CLEdBQUcsSUFBSSxjQUFjLENBQVMsb0JBQW9CLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rpb25Ub2tlbn0gZnJvbSAnLi4vZGkvaW5qZWN0aW9uX3Rva2VuJztcblxuLyoqXG4gKiBQcm92aWRlIHRoaXMgdG9rZW4gdG8gc2V0IHRoZSBsb2NhbGUgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAqIEl0IGlzIHVzZWQgZm9yIGkxOG4gZXh0cmFjdGlvbiwgYnkgaTE4biBwaXBlcyAoRGF0ZVBpcGUsIEkxOG5QbHVyYWxQaXBlLCBDdXJyZW5jeVBpcGUsXG4gKiBEZWNpbWFsUGlwZSBhbmQgUGVyY2VudFBpcGUpIGFuZCBieSBJQ1UgZXhwcmVzc2lvbnMuXG4gKlxuICogU2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2kxOG4jc2V0dGluZy11cC1sb2NhbGUgaTE4biBndWlkZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBMT0NBTEVfSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuICogaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAvYXBwLm1vZHVsZSc7XG4gKlxuICogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IExPQ0FMRV9JRCwgdXNlVmFsdWU6ICdlbi1VUycgfV1cbiAqIH0pO1xuICogYGBgXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY29uc3QgTE9DQUxFX0lEID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ0xvY2FsZUlkJyk7XG5cbi8qKlxuICogVXNlIHRoaXMgdG9rZW4gYXQgYm9vdHN0cmFwIHRvIHByb3ZpZGUgdGhlIGNvbnRlbnQgb2YgeW91ciB0cmFuc2xhdGlvbiBmaWxlIChgeHRiYCxcbiAqIGB4bGZgIG9yIGB4bGYyYCkgd2hlbiB5b3Ugd2FudCB0byB0cmFuc2xhdGUgeW91ciBhcHBsaWNhdGlvbiBpbiBhbm90aGVyIGxhbmd1YWdlLlxuICpcbiAqIFNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9pMThuI21lcmdlIGkxOG4gZ3VpZGV9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgVFJBTlNMQVRJT05TIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQgeyBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcbiAqIGltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gJy4vYXBwL2FwcC5tb2R1bGUnO1xuICpcbiAqIC8vIGNvbnRlbnQgb2YgeW91ciB0cmFuc2xhdGlvbiBmaWxlXG4gKiBjb25zdCB0cmFuc2xhdGlvbnMgPSAnLi4uLic7XG4gKlxuICogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFRSQU5TTEFUSU9OUywgdXNlVmFsdWU6IHRyYW5zbGF0aW9ucyB9XVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjb25zdCBUUkFOU0xBVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPignVHJhbnNsYXRpb25zJyk7XG5cbi8qKlxuICogUHJvdmlkZSB0aGlzIHRva2VuIGF0IGJvb3RzdHJhcCB0byBzZXQgdGhlIGZvcm1hdCBvZiB5b3VyIHtAbGluayBUUkFOU0xBVElPTlN9OiBgeHRiYCxcbiAqIGB4bGZgIG9yIGB4bGYyYC5cbiAqXG4gKiBTZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvaTE4biNtZXJnZSBpMThuIGd1aWRlfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IFRSQU5TTEFUSU9OU19GT1JNQVQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuICogaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAvYXBwLm1vZHVsZSc7XG4gKlxuICogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IFRSQU5TTEFUSU9OU19GT1JNQVQsIHVzZVZhbHVlOiAneGxmJyB9XVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhwZXJpbWVudGFsIGkxOG4gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjb25zdCBUUkFOU0xBVElPTlNfRk9STUFUID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ1RyYW5zbGF0aW9uc0Zvcm1hdCcpO1xuXG4vKipcbiAqIFVzZSB0aGlzIGVudW0gYXQgYm9vdHN0cmFwIGFzIGFuIG9wdGlvbiBvZiBgYm9vdHN0cmFwTW9kdWxlYCB0byBkZWZpbmUgdGhlIHN0cmF0ZWd5XG4gKiB0aGF0IHRoZSBjb21waWxlciBzaG91bGQgdXNlIGluIGNhc2Ugb2YgbWlzc2luZyB0cmFuc2xhdGlvbnM6XG4gKiAtIEVycm9yOiB0aHJvdyBpZiB5b3UgaGF2ZSBtaXNzaW5nIHRyYW5zbGF0aW9ucy5cbiAqIC0gV2FybmluZyAoZGVmYXVsdCk6IHNob3cgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGFuZC9vciBzaGVsbC5cbiAqIC0gSWdub3JlOiBkbyBub3RoaW5nLlxuICpcbiAqIFNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9pMThuI21pc3NpbmctdHJhbnNsYXRpb24gaTE4biBndWlkZX0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKiBpbXBvcnQgeyBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcbiAqIGltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gJy4vYXBwL2FwcC5tb2R1bGUnO1xuICpcbiAqIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlLCB7XG4gKiAgIG1pc3NpbmdUcmFuc2xhdGlvbjogTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuRXJyb3JcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQGV4cGVyaW1lbnRhbCBpMThuIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZW51bSBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneSB7XG4gIEVycm9yID0gMCxcbiAgV2FybmluZyA9IDEsXG4gIElnbm9yZSA9IDIsXG59XG4iXX0=