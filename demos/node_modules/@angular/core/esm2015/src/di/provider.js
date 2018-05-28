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
/**
 * \@usageNotes
 * ```
 * \@Injectable(SomeModule, {useValue: 'someValue'})
 * class SomeClass {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value for a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ValueSansProvider'}
 *
 * \@experimental
 * @record
 */
export function ValueSansProvider() { }
function ValueSansProvider_tsickle_Closure_declarations() {
    /**
     * The value to inject.
     * @type {?}
     */
    ValueSansProvider.prototype.useValue;
}
/**
 * \@usageNotes
 * ```
 * const provider: ValueProvider = {provide: 'someToken', useValue: 'someValue'};
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value for a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ValueProvider'}
 *
 *
 * @record
 */
export function ValueProvider() { }
function ValueProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    ValueProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    ValueProvider.prototype.multi;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable(SomeModule, {useClass: MyService, deps: []})
 * class MyService {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='StaticClassSansProvider'}
 *
 * \@experimental
 * @record
 */
export function StaticClassSansProvider() { }
function StaticClassSansProvider_tsickle_Closure_declarations() {
    /**
     * An optional class to instantiate for the `token`. (If not provided `provide` is assumed to be a
     * class to instantiate)
     * @type {?}
     */
    StaticClassSansProvider.prototype.useClass;
    /**
     * A list of `token`s which need to be resolved by the injector. The list of values is then
     * used as arguments to the `useClass` constructor.
     * @type {?}
     */
    StaticClassSansProvider.prototype.deps;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService, deps: []};
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='StaticClassProvider'}
 *
 * Note that following two providers are not equal:
 * {\@example core/di/ts/provider_spec.ts region='StaticClassProviderDifference'}
 *
 *
 * @record
 */
export function StaticClassProvider() { }
function StaticClassProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    StaticClassProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    StaticClassProvider.prototype.multi;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable(SomeModule, {deps: []})
 * class MyService {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ConstructorSansProvider'}
 *
 * \@experimental
 * @record
 */
export function ConstructorSansProvider() { }
function ConstructorSansProvider_tsickle_Closure_declarations() {
    /**
     * A list of `token`s which need to be resolved by the injector. The list of values is then
     * used as arguments to the `useClass` constructor.
     * @type {?|undefined}
     */
    ConstructorSansProvider.prototype.deps;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: MyClass, deps: []};
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ConstructorProvider'}
 *
 *
 * @record
 */
export function ConstructorProvider() { }
function ConstructorProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    ConstructorProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    ConstructorProvider.prototype.multi;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable(SomeModule, {useExisting: 'someOtherToken'})
 * class SomeClass {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ExistingSansProvider'}
 *
 *
 * @record
 */
export function ExistingSansProvider() { }
function ExistingSansProvider_tsickle_Closure_declarations() {
    /**
     * Existing `token` to return. (equivalent to `injector.get(useExisting)`)
     * @type {?}
     */
    ExistingSansProvider.prototype.useExisting;
}
/**
 * \@usageNotes
 * ```
 * const provider: ExistingProvider = {provide: 'someToken', useExisting: 'someOtherToken'};
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value of another `useExisting` token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ExistingProvider'}
 *
 *
 * @record
 */
export function ExistingProvider() { }
function ExistingProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    ExistingProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    ExistingProvider.prototype.multi;
}
/**
 * \@usageNotes
 * ```
 * function serviceFactory() { ... }
 *
 * \@Injectable(SomeModule, {useFactory: serviceFactory, deps: []})
 * class SomeClass {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='FactorySansProvider'}
 *
 * \@experimental
 * @record
 */
export function FactorySansProvider() { }
function FactorySansProvider_tsickle_Closure_declarations() {
    /**
     * A function to invoke to create a value for this `token`. The function is invoked with
     * resolved values of `token`s in the `deps` field.
     * @type {?}
     */
    FactorySansProvider.prototype.useFactory;
    /**
     * A list of `token`s which need to be resolved by the injector. The list of values is then
     * used as arguments to the `useFactory` function.
     * @type {?|undefined}
     */
    FactorySansProvider.prototype.deps;
}
/**
 * \@usageNotes
 * ```
 * function serviceFactory() { ... }
 *
 * const provider: FactoryProvider = {provide: 'someToken', useFactory: serviceFactory, deps: []};
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value by invoking a `useFactory` function.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='FactoryProvider'}
 *
 * Dependencies can also be marked as optional:
 * {\@example core/di/ts/provider_spec.ts region='FactoryProviderOptionalDeps'}
 *
 *
 * @record
 */
export function FactoryProvider() { }
function FactoryProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    FactoryProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    FactoryProvider.prototype.multi;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable()
 * class MyService {}
 *
 * const provider: TypeProvider = MyService;
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of `Type` when `Type' is used as the token.
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='TypeProvider'}
 *
 *
 * @record
 */
export function TypeProvider() { }
function TypeProvider_tsickle_Closure_declarations() {
}
/**
 * \@usageNotes
 * ```
 *
 * class SomeClassImpl {}
 *
 * \@Injectable(SomeModule, {useClass: SomeClassImpl})
 * class SomeClass {}
 * ```
 *
 * \@description
 * Configures the `Injector` to return a value by invoking a `useClass` function.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ClassSansProvider'}
 *
 * \@experimental
 * @record
 */
export function ClassSansProvider() { }
function ClassSansProvider_tsickle_Closure_declarations() {
    /**
     * Class to instantiate for the `token`.
     * @type {?}
     */
    ClassSansProvider.prototype.useClass;
}
/**
 * \@usageNotes
 * ```
 * \@Injectable()
 * class MyService {}
 *
 * const provider: ClassProvider = {provide: 'someToken', useClass: MyService};
 * ```
 *
 * \@description
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * For more details, see the {\@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
 *
 * ### Example
 *
 * {\@example core/di/ts/provider_spec.ts region='ClassProvider'}
 *
 * Note that following two providers are not equal:
 * {\@example core/di/ts/provider_spec.ts region='ClassProviderDifference'}
 *
 *
 * @record
 */
export function ClassProvider() { }
function ClassProvider_tsickle_Closure_declarations() {
    /**
     * An injection token. (Typically an instance of `Type` or `InjectionToken`, but can be `any`).
     * @type {?}
     */
    ClassProvider.prototype.provide;
    /**
     * If true, then injector returns an array of instances. This is useful to allow multiple
     * providers spread across many files to provide configuration information to a common token.
     *
     * ### Example
     *
     * {\@example core/di/ts/provider_spec.ts region='MultiProviderAspect'}
     * @type {?|undefined}
     */
    ClassProvider.prototype.multi;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9kaS9wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJy4uL3R5cGUnO1xuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKFNvbWVNb2R1bGUsIHt1c2VWYWx1ZTogJ3NvbWVWYWx1ZSd9KVxuICogY2xhc3MgU29tZUNsYXNzIHt9XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGEgdmFsdWUgZm9yIGEgdG9rZW4uXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nVmFsdWVTYW5zUHJvdmlkZXInfVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWx1ZVNhbnNQcm92aWRlciB7XG4gIC8qKlxuICAgKiBUaGUgdmFsdWUgdG8gaW5qZWN0LlxuICAgKi9cbiAgdXNlVmFsdWU6IGFueTtcbn1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiBjb25zdCBwcm92aWRlcjogVmFsdWVQcm92aWRlciA9IHtwcm92aWRlOiAnc29tZVRva2VuJywgdXNlVmFsdWU6ICdzb21lVmFsdWUnfTtcbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ29uZmlndXJlcyB0aGUgYEluamVjdG9yYCB0byByZXR1cm4gYSB2YWx1ZSBmb3IgYSB0b2tlbi5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24gXCJEZXBlbmRlbmN5IEluamVjdGlvbiBHdWlkZVwifS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL3Byb3ZpZGVyX3NwZWMudHMgcmVnaW9uPSdWYWx1ZVByb3ZpZGVyJ31cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbHVlUHJvdmlkZXIgZXh0ZW5kcyBWYWx1ZVNhbnNQcm92aWRlciB7XG4gIC8qKlxuICAgKiBBbiBpbmplY3Rpb24gdG9rZW4uIChUeXBpY2FsbHkgYW4gaW5zdGFuY2Ugb2YgYFR5cGVgIG9yIGBJbmplY3Rpb25Ub2tlbmAsIGJ1dCBjYW4gYmUgYGFueWApLlxuICAgKi9cbiAgcHJvdmlkZTogYW55O1xuXG4gIC8qKlxuICAgKiBJZiB0cnVlLCB0aGVuIGluamVjdG9yIHJldHVybnMgYW4gYXJyYXkgb2YgaW5zdGFuY2VzLiBUaGlzIGlzIHVzZWZ1bCB0byBhbGxvdyBtdWx0aXBsZVxuICAgKiBwcm92aWRlcnMgc3ByZWFkIGFjcm9zcyBtYW55IGZpbGVzIHRvIHByb3ZpZGUgY29uZmlndXJhdGlvbiBpbmZvcm1hdGlvbiB0byBhIGNvbW1vbiB0b2tlbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J011bHRpUHJvdmlkZXJBc3BlY3QnfVxuICAgKi9cbiAgbXVsdGk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKFNvbWVNb2R1bGUsIHt1c2VDbGFzczogTXlTZXJ2aWNlLCBkZXBzOiBbXX0pXG4gKiBjbGFzcyBNeVNlcnZpY2Uge31cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ29uZmlndXJlcyB0aGUgYEluamVjdG9yYCB0byByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYHVzZUNsYXNzYCBmb3IgYSB0b2tlbi5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24gXCJEZXBlbmRlbmN5IEluamVjdGlvbiBHdWlkZVwifS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL3Byb3ZpZGVyX3NwZWMudHMgcmVnaW9uPSdTdGF0aWNDbGFzc1NhbnNQcm92aWRlcid9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRpY0NsYXNzU2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIGNsYXNzIHRvIGluc3RhbnRpYXRlIGZvciB0aGUgYHRva2VuYC4gKElmIG5vdCBwcm92aWRlZCBgcHJvdmlkZWAgaXMgYXNzdW1lZCB0byBiZSBhXG4gICAqIGNsYXNzIHRvIGluc3RhbnRpYXRlKVxuICAgKi9cbiAgdXNlQ2xhc3M6IFR5cGU8YW55PjtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIGB0b2tlbmBzIHdoaWNoIG5lZWQgdG8gYmUgcmVzb2x2ZWQgYnkgdGhlIGluamVjdG9yLiBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgdGhlblxuICAgKiB1c2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgYHVzZUNsYXNzYCBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGRlcHM6IGFueVtdO1xufVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIE15U2VydmljZSB7fVxuICpcbiAqIGNvbnN0IHByb3ZpZGVyOiBDbGFzc1Byb3ZpZGVyID0ge3Byb3ZpZGU6ICdzb21lVG9rZW4nLCB1c2VDbGFzczogTXlTZXJ2aWNlLCBkZXBzOiBbXX07XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGB1c2VDbGFzc2AgZm9yIGEgdG9rZW4uXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nU3RhdGljQ2xhc3NQcm92aWRlcid9XG4gKlxuICogTm90ZSB0aGF0IGZvbGxvd2luZyB0d28gcHJvdmlkZXJzIGFyZSBub3QgZXF1YWw6XG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nU3RhdGljQ2xhc3NQcm92aWRlckRpZmZlcmVuY2UnfVxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhdGljQ2xhc3NQcm92aWRlciBleHRlbmRzIFN0YXRpY0NsYXNzU2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEFuIGluamVjdGlvbiB0b2tlbi4gKFR5cGljYWxseSBhbiBpbnN0YW5jZSBvZiBgVHlwZWAgb3IgYEluamVjdGlvblRva2VuYCwgYnV0IGNhbiBiZSBgYW55YCkuXG4gICAqL1xuICBwcm92aWRlOiBhbnk7XG5cbiAgLyoqXG4gICAqIElmIHRydWUsIHRoZW4gaW5qZWN0b3IgcmV0dXJucyBhbiBhcnJheSBvZiBpbnN0YW5jZXMuIFRoaXMgaXMgdXNlZnVsIHRvIGFsbG93IG11bHRpcGxlXG4gICAqIHByb3ZpZGVycyBzcHJlYWQgYWNyb3NzIG1hbnkgZmlsZXMgdG8gcHJvdmlkZSBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIHRvIGEgY29tbW9uIHRva2VuLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nTXVsdGlQcm92aWRlckFzcGVjdCd9XG4gICAqL1xuICBtdWx0aT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogQEluamVjdGFibGUoU29tZU1vZHVsZSwge2RlcHM6IFtdfSlcbiAqIGNsYXNzIE15U2VydmljZSB7fVxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDb25maWd1cmVzIHRoZSBgSW5qZWN0b3JgIHRvIHJldHVybiBhbiBpbnN0YW5jZSBvZiBhIHRva2VuLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbiBcIkRlcGVuZGVuY3kgSW5qZWN0aW9uIEd1aWRlXCJ9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0NvbnN0cnVjdG9yU2Fuc1Byb3ZpZGVyJ31cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RydWN0b3JTYW5zUHJvdmlkZXIge1xuICAvKipcbiAgICogQSBsaXN0IG9mIGB0b2tlbmBzIHdoaWNoIG5lZWQgdG8gYmUgcmVzb2x2ZWQgYnkgdGhlIGluamVjdG9yLiBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgdGhlblxuICAgKiB1c2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgYHVzZUNsYXNzYCBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGRlcHM/OiBhbnlbXTtcbn1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBNeVNlcnZpY2Uge31cbiAqXG4gKiBjb25zdCBwcm92aWRlcjogQ2xhc3NQcm92aWRlciA9IHtwcm92aWRlOiBNeUNsYXNzLCBkZXBzOiBbXX07XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGFuIGluc3RhbmNlIG9mIGEgdG9rZW4uXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nQ29uc3RydWN0b3JQcm92aWRlcid9XG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25zdHJ1Y3RvclByb3ZpZGVyIGV4dGVuZHMgQ29uc3RydWN0b3JTYW5zUHJvdmlkZXIge1xuICAvKipcbiAgICogQW4gaW5qZWN0aW9uIHRva2VuLiAoVHlwaWNhbGx5IGFuIGluc3RhbmNlIG9mIGBUeXBlYCBvciBgSW5qZWN0aW9uVG9rZW5gLCBidXQgY2FuIGJlIGBhbnlgKS5cbiAgICovXG4gIHByb3ZpZGU6IFR5cGU8YW55PjtcblxuICAvKipcbiAgICogSWYgdHJ1ZSwgdGhlbiBpbmplY3RvciByZXR1cm5zIGFuIGFycmF5IG9mIGluc3RhbmNlcy4gVGhpcyBpcyB1c2VmdWwgdG8gYWxsb3cgbXVsdGlwbGVcbiAgICogcHJvdmlkZXJzIHNwcmVhZCBhY3Jvc3MgbWFueSBmaWxlcyB0byBwcm92aWRlIGNvbmZpZ3VyYXRpb24gaW5mb3JtYXRpb24gdG8gYSBjb21tb24gdG9rZW4uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL3Byb3ZpZGVyX3NwZWMudHMgcmVnaW9uPSdNdWx0aVByb3ZpZGVyQXNwZWN0J31cbiAgICovXG4gIG11bHRpPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiBASW5qZWN0YWJsZShTb21lTW9kdWxlLCB7dXNlRXhpc3Rpbmc6ICdzb21lT3RoZXJUb2tlbid9KVxuICogY2xhc3MgU29tZUNsYXNzIHt9XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGEgdmFsdWUgb2YgYW5vdGhlciBgdXNlRXhpc3RpbmdgIHRva2VuLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbiBcIkRlcGVuZGVuY3kgSW5qZWN0aW9uIEd1aWRlXCJ9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0V4aXN0aW5nU2Fuc1Byb3ZpZGVyJ31cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4aXN0aW5nU2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEV4aXN0aW5nIGB0b2tlbmAgdG8gcmV0dXJuLiAoZXF1aXZhbGVudCB0byBgaW5qZWN0b3IuZ2V0KHVzZUV4aXN0aW5nKWApXG4gICAqL1xuICB1c2VFeGlzdGluZzogYW55O1xufVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIGNvbnN0IHByb3ZpZGVyOiBFeGlzdGluZ1Byb3ZpZGVyID0ge3Byb3ZpZGU6ICdzb21lVG9rZW4nLCB1c2VFeGlzdGluZzogJ3NvbWVPdGhlclRva2VuJ307XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGEgdmFsdWUgb2YgYW5vdGhlciBgdXNlRXhpc3RpbmdgIHRva2VuLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbiBcIkRlcGVuZGVuY3kgSW5qZWN0aW9uIEd1aWRlXCJ9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0V4aXN0aW5nUHJvdmlkZXInfVxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXhpc3RpbmdQcm92aWRlciBleHRlbmRzIEV4aXN0aW5nU2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEFuIGluamVjdGlvbiB0b2tlbi4gKFR5cGljYWxseSBhbiBpbnN0YW5jZSBvZiBgVHlwZWAgb3IgYEluamVjdGlvblRva2VuYCwgYnV0IGNhbiBiZSBgYW55YCkuXG4gICAqL1xuICBwcm92aWRlOiBhbnk7XG5cbiAgLyoqXG4gICAqIElmIHRydWUsIHRoZW4gaW5qZWN0b3IgcmV0dXJucyBhbiBhcnJheSBvZiBpbnN0YW5jZXMuIFRoaXMgaXMgdXNlZnVsIHRvIGFsbG93IG11bHRpcGxlXG4gICAqIHByb3ZpZGVycyBzcHJlYWQgYWNyb3NzIG1hbnkgZmlsZXMgdG8gcHJvdmlkZSBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIHRvIGEgY29tbW9uIHRva2VuLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nTXVsdGlQcm92aWRlckFzcGVjdCd9XG4gICAqL1xuICBtdWx0aT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogZnVuY3Rpb24gc2VydmljZUZhY3RvcnkoKSB7IC4uLiB9XG4gKlxuICogQEluamVjdGFibGUoU29tZU1vZHVsZSwge3VzZUZhY3Rvcnk6IHNlcnZpY2VGYWN0b3J5LCBkZXBzOiBbXX0pXG4gKiBjbGFzcyBTb21lQ2xhc3Mge31cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ29uZmlndXJlcyB0aGUgYEluamVjdG9yYCB0byByZXR1cm4gYSB2YWx1ZSBieSBpbnZva2luZyBhIGB1c2VGYWN0b3J5YCBmdW5jdGlvbi5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24gXCJEZXBlbmRlbmN5IEluamVjdGlvbiBHdWlkZVwifS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL3Byb3ZpZGVyX3NwZWMudHMgcmVnaW9uPSdGYWN0b3J5U2Fuc1Byb3ZpZGVyJ31cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWN0b3J5U2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdG8gaW52b2tlIHRvIGNyZWF0ZSBhIHZhbHVlIGZvciB0aGlzIGB0b2tlbmAuIFRoZSBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGhcbiAgICogcmVzb2x2ZWQgdmFsdWVzIG9mIGB0b2tlbmBzIGluIHRoZSBgZGVwc2AgZmllbGQuXG4gICAqL1xuICB1c2VGYWN0b3J5OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIGB0b2tlbmBzIHdoaWNoIG5lZWQgdG8gYmUgcmVzb2x2ZWQgYnkgdGhlIGluamVjdG9yLiBUaGUgbGlzdCBvZiB2YWx1ZXMgaXMgdGhlblxuICAgKiB1c2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgYHVzZUZhY3RvcnlgIGZ1bmN0aW9uLlxuICAgKi9cbiAgZGVwcz86IGFueVtdO1xufVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIGZ1bmN0aW9uIHNlcnZpY2VGYWN0b3J5KCkgeyAuLi4gfVxuICpcbiAqIGNvbnN0IHByb3ZpZGVyOiBGYWN0b3J5UHJvdmlkZXIgPSB7cHJvdmlkZTogJ3NvbWVUb2tlbicsIHVzZUZhY3Rvcnk6IHNlcnZpY2VGYWN0b3J5LCBkZXBzOiBbXX07XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbmZpZ3VyZXMgdGhlIGBJbmplY3RvcmAgdG8gcmV0dXJuIGEgdmFsdWUgYnkgaW52b2tpbmcgYSBgdXNlRmFjdG9yeWAgZnVuY3Rpb24uXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nRmFjdG9yeVByb3ZpZGVyJ31cbiAqXG4gKiBEZXBlbmRlbmNpZXMgY2FuIGFsc28gYmUgbWFya2VkIGFzIG9wdGlvbmFsOlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0ZhY3RvcnlQcm92aWRlck9wdGlvbmFsRGVwcyd9XG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWN0b3J5UHJvdmlkZXIgZXh0ZW5kcyBGYWN0b3J5U2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIEFuIGluamVjdGlvbiB0b2tlbi4gKFR5cGljYWxseSBhbiBpbnN0YW5jZSBvZiBgVHlwZWAgb3IgYEluamVjdGlvblRva2VuYCwgYnV0IGNhbiBiZSBgYW55YCkuXG4gICAqL1xuICBwcm92aWRlOiBhbnk7XG5cbiAgLyoqXG4gICAqIElmIHRydWUsIHRoZW4gaW5qZWN0b3IgcmV0dXJucyBhbiBhcnJheSBvZiBpbnN0YW5jZXMuIFRoaXMgaXMgdXNlZnVsIHRvIGFsbG93IG11bHRpcGxlXG4gICAqIHByb3ZpZGVycyBzcHJlYWQgYWNyb3NzIG1hbnkgZmlsZXMgdG8gcHJvdmlkZSBjb25maWd1cmF0aW9uIGluZm9ybWF0aW9uIHRvIGEgY29tbW9uIHRva2VuLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nTXVsdGlQcm92aWRlckFzcGVjdCd9XG4gICAqL1xuICBtdWx0aT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIFNlZSB7QGxpbmsgVmFsdWVQcm92aWRlcn0sIHtAbGluayBFeGlzdGluZ1Byb3ZpZGVyfSwge0BsaW5rIEZhY3RvcnlQcm92aWRlcn0uXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEZXNjcmliZXMgaG93IHRoZSBgSW5qZWN0b3JgIHNob3VsZCBiZSBjb25maWd1cmVkIGluIGEgc3RhdGljIHdheSAoV2l0aG91dCByZWZsZWN0aW9uKS5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24gXCJEZXBlbmRlbmN5IEluamVjdGlvbiBHdWlkZVwifS5cbiAqXG4gKlxuICovXG5leHBvcnQgdHlwZSBTdGF0aWNQcm92aWRlciA9IFZhbHVlUHJvdmlkZXIgfCBFeGlzdGluZ1Byb3ZpZGVyIHwgU3RhdGljQ2xhc3NQcm92aWRlciB8XG4gICAgQ29uc3RydWN0b3JQcm92aWRlciB8IEZhY3RvcnlQcm92aWRlciB8IGFueVtdO1xuXG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTXlTZXJ2aWNlIHt9XG4gKlxuICogY29uc3QgcHJvdmlkZXI6IFR5cGVQcm92aWRlciA9IE15U2VydmljZTtcbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ29uZmlndXJlcyB0aGUgYEluamVjdG9yYCB0byByZXR1cm4gYW4gaW5zdGFuY2Ugb2YgYFR5cGVgIHdoZW4gYFR5cGUnIGlzIHVzZWQgYXMgdGhlIHRva2VuLlxuICpcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBieSBpbnZva2luZyB0aGUgYG5ld2Agb3BlcmF0b3IgYW5kIHN1cHBseWluZyBhZGRpdGlvbmFsIGFyZ3VtZW50cy5cbiAqIFRoaXMgZm9ybSBpcyBhIHNob3J0IGZvcm0gb2YgYFR5cGVQcm92aWRlcmA7XG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9kaS90cy9wcm92aWRlcl9zcGVjLnRzIHJlZ2lvbj0nVHlwZVByb3ZpZGVyJ31cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVQcm92aWRlciBleHRlbmRzIFR5cGU8YW55PiB7fVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqXG4gKiBjbGFzcyBTb21lQ2xhc3NJbXBsIHt9XG4gKlxuICogQEluamVjdGFibGUoU29tZU1vZHVsZSwge3VzZUNsYXNzOiBTb21lQ2xhc3NJbXBsfSlcbiAqIGNsYXNzIFNvbWVDbGFzcyB7fVxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDb25maWd1cmVzIHRoZSBgSW5qZWN0b3JgIHRvIHJldHVybiBhIHZhbHVlIGJ5IGludm9raW5nIGEgYHVzZUNsYXNzYCBmdW5jdGlvbi5cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUgdGhlIHtAbGlua0RvY3MgZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24gXCJEZXBlbmRlbmN5IEluamVjdGlvbiBHdWlkZVwifS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2RpL3RzL3Byb3ZpZGVyX3NwZWMudHMgcmVnaW9uPSdDbGFzc1NhbnNQcm92aWRlcid9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzU2Fuc1Byb3ZpZGVyIHtcbiAgLyoqXG4gICAqIENsYXNzIHRvIGluc3RhbnRpYXRlIGZvciB0aGUgYHRva2VuYC5cbiAgICovXG4gIHVzZUNsYXNzOiBUeXBlPGFueT47XG59XG5cbi8qKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgTXlTZXJ2aWNlIHt9XG4gKlxuICogY29uc3QgcHJvdmlkZXI6IENsYXNzUHJvdmlkZXIgPSB7cHJvdmlkZTogJ3NvbWVUb2tlbicsIHVzZUNsYXNzOiBNeVNlcnZpY2V9O1xuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDb25maWd1cmVzIHRoZSBgSW5qZWN0b3JgIHRvIHJldHVybiBhbiBpbnN0YW5jZSBvZiBgdXNlQ2xhc3NgIGZvciBhIHRva2VuLlxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMsIHNlZSB0aGUge0BsaW5rRG9jcyBndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbiBcIkRlcGVuZGVuY3kgSW5qZWN0aW9uIEd1aWRlXCJ9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0NsYXNzUHJvdmlkZXInfVxuICpcbiAqIE5vdGUgdGhhdCBmb2xsb3dpbmcgdHdvIHByb3ZpZGVycyBhcmUgbm90IGVxdWFsOlxuICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J0NsYXNzUHJvdmlkZXJEaWZmZXJlbmNlJ31cbiAqXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzUHJvdmlkZXIgZXh0ZW5kcyBDbGFzc1NhbnNQcm92aWRlciB7XG4gIC8qKlxuICAgKiBBbiBpbmplY3Rpb24gdG9rZW4uIChUeXBpY2FsbHkgYW4gaW5zdGFuY2Ugb2YgYFR5cGVgIG9yIGBJbmplY3Rpb25Ub2tlbmAsIGJ1dCBjYW4gYmUgYGFueWApLlxuICAgKi9cbiAgcHJvdmlkZTogYW55O1xuXG4gIC8qKlxuICAgKiBJZiB0cnVlLCB0aGVuIGluamVjdG9yIHJldHVybnMgYW4gYXJyYXkgb2YgaW5zdGFuY2VzLiBUaGlzIGlzIHVzZWZ1bCB0byBhbGxvdyBtdWx0aXBsZVxuICAgKiBwcm92aWRlcnMgc3ByZWFkIGFjcm9zcyBtYW55IGZpbGVzIHRvIHByb3ZpZGUgY29uZmlndXJhdGlvbiBpbmZvcm1hdGlvbiB0byBhIGNvbW1vbiB0b2tlbi5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvZGkvdHMvcHJvdmlkZXJfc3BlYy50cyByZWdpb249J011bHRpUHJvdmlkZXJBc3BlY3QnfVxuICAgKi9cbiAgbXVsdGk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIEB1c2FnZU5vdGVzXG4gKiBTZWUge0BsaW5rIFR5cGVQcm92aWRlcn0sIHtAbGluayBDbGFzc1Byb3ZpZGVyfSwge0BsaW5rIFN0YXRpY1Byb3ZpZGVyfS5cbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERlc2NyaWJlcyBob3cgdGhlIGBJbmplY3RvcmAgc2hvdWxkIGJlIGNvbmZpZ3VyZWQuXG4gKlxuICogRm9yIG1vcmUgZGV0YWlscywgc2VlIHRoZSB7QGxpbmtEb2NzIGd1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uIFwiRGVwZW5kZW5jeSBJbmplY3Rpb24gR3VpZGVcIn0uXG4gKlxuICpcbiAqL1xuZXhwb3J0IHR5cGUgUHJvdmlkZXIgPVxuICAgIFR5cGVQcm92aWRlciB8IFZhbHVlUHJvdmlkZXIgfCBDbGFzc1Byb3ZpZGVyIHwgRXhpc3RpbmdQcm92aWRlciB8IEZhY3RvcnlQcm92aWRlciB8IGFueVtdO1xuIl19