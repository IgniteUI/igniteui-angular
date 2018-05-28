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
import { Injector } from '../di/injector';
import { NgModuleFactory } from '../linker/ng_module_factory';
import { initServicesIfNeeded } from './services';
import { Services } from './types';
import { resolveDefinition } from './util';
/**
 * @param {?} override
 * @return {?}
 */
export function overrideProvider(override) {
    initServicesIfNeeded();
    return Services.overrideProvider(override);
}
/**
 * @param {?} comp
 * @param {?} componentFactory
 * @return {?}
 */
export function overrideComponentView(comp, componentFactory) {
    initServicesIfNeeded();
    return Services.overrideComponentView(comp, componentFactory);
}
/**
 * @return {?}
 */
export function clearOverrides() {
    initServicesIfNeeded();
    return Services.clearOverrides();
}
/**
 * @param {?} ngModuleType
 * @param {?} bootstrapComponents
 * @param {?} defFactory
 * @return {?}
 */
export function createNgModuleFactory(ngModuleType, bootstrapComponents, defFactory) {
    return new NgModuleFactory_(ngModuleType, bootstrapComponents, defFactory);
}
class NgModuleFactory_ extends NgModuleFactory {
    /**
     * @param {?} moduleType
     * @param {?} _bootstrapComponents
     * @param {?} _ngModuleDefFactory
     */
    constructor(moduleType, _bootstrapComponents, _ngModuleDefFactory) {
        // Attention: this ctor is called as top level function.
        // Putting any logic in here will destroy closure tree shaking!
        super();
        this.moduleType = moduleType;
        this._bootstrapComponents = _bootstrapComponents;
        this._ngModuleDefFactory = _ngModuleDefFactory;
    }
    /**
     * @param {?} parentInjector
     * @return {?}
     */
    create(parentInjector) {
        initServicesIfNeeded();
        const /** @type {?} */ def = resolveDefinition(this._ngModuleDefFactory);
        return Services.createNgModuleRef(this.moduleType, parentInjector || Injector.NULL, this._bootstrapComponents, def);
    }
}
function NgModuleFactory__tsickle_Closure_declarations() {
    /** @type {?} */
    NgModuleFactory_.prototype.moduleType;
    /** @type {?} */
    NgModuleFactory_.prototype._bootstrapComponents;
    /** @type {?} */
    NgModuleFactory_.prototype._ngModuleDefFactory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlwb2ludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3ZpZXcvZW50cnlwb2ludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsZUFBZSxFQUFjLE1BQU0sNkJBQTZCLENBQUM7QUFHekUsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2hELE9BQU8sRUFBOEMsUUFBUSxFQUFpQixNQUFNLFNBQVMsQ0FBQztBQUM5RixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7O0FBRXpDLE1BQU0sMkJBQTJCLFFBQTBCO0lBQ3pELG9CQUFvQixFQUFFLENBQUM7SUFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM1Qzs7Ozs7O0FBRUQsTUFBTSxnQ0FBZ0MsSUFBZSxFQUFFLGdCQUF1QztJQUM1RixvQkFBb0IsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7Q0FDL0Q7Ozs7QUFFRCxNQUFNO0lBQ0osb0JBQW9CLEVBQUUsQ0FBQztJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQ2xDOzs7Ozs7O0FBSUQsTUFBTSxnQ0FDRixZQUF1QixFQUFFLG1CQUFnQyxFQUN6RCxVQUFxQztJQUN2QyxNQUFNLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDNUU7QUFFRCxzQkFBdUIsU0FBUSxlQUFvQjs7Ozs7O0lBQ2pELFlBQ29CLFlBQStCLG9CQUFpQyxFQUN4RTs7O1FBR1YsS0FBSyxFQUFFLENBQUM7UUFKVSxlQUFVLEdBQVYsVUFBVTtRQUFxQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQWE7UUFDeEUsd0JBQW1CLEdBQW5CLG1CQUFtQjtLQUk5Qjs7Ozs7SUFFRCxNQUFNLENBQUMsY0FBNkI7UUFDbEMsb0JBQW9CLEVBQUUsQ0FBQztRQUN2Qix1QkFBTSxHQUFHLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FDN0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxjQUFjLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDdkY7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnLi4vZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5fSBmcm9tICcuLi9saW5rZXIvY29tcG9uZW50X2ZhY3RvcnknO1xuaW1wb3J0IHtOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmfSBmcm9tICcuLi9saW5rZXIvbmdfbW9kdWxlX2ZhY3RvcnknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICcuLi90eXBlJztcblxuaW1wb3J0IHtpbml0U2VydmljZXNJZk5lZWRlZH0gZnJvbSAnLi9zZXJ2aWNlcyc7XG5pbXBvcnQge05nTW9kdWxlRGVmaW5pdGlvbkZhY3RvcnksIFByb3ZpZGVyT3ZlcnJpZGUsIFNlcnZpY2VzLCBWaWV3RGVmaW5pdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge3Jlc29sdmVEZWZpbml0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVQcm92aWRlcihvdmVycmlkZTogUHJvdmlkZXJPdmVycmlkZSkge1xuICBpbml0U2VydmljZXNJZk5lZWRlZCgpO1xuICByZXR1cm4gU2VydmljZXMub3ZlcnJpZGVQcm92aWRlcihvdmVycmlkZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUNvbXBvbmVudFZpZXcoY29tcDogVHlwZTxhbnk+LCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4pIHtcbiAgaW5pdFNlcnZpY2VzSWZOZWVkZWQoKTtcbiAgcmV0dXJuIFNlcnZpY2VzLm92ZXJyaWRlQ29tcG9uZW50Vmlldyhjb21wLCBjb21wb25lbnRGYWN0b3J5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyT3ZlcnJpZGVzKCkge1xuICBpbml0U2VydmljZXNJZk5lZWRlZCgpO1xuICByZXR1cm4gU2VydmljZXMuY2xlYXJPdmVycmlkZXMoKTtcbn1cblxuLy8gQXR0ZW50aW9uOiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBhcyB0b3AgbGV2ZWwgZnVuY3Rpb24uXG4vLyBQdXR0aW5nIGFueSBsb2dpYyBpbiBoZXJlIHdpbGwgZGVzdHJveSBjbG9zdXJlIHRyZWUgc2hha2luZyFcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVOZ01vZHVsZUZhY3RvcnkoXG4gICAgbmdNb2R1bGVUeXBlOiBUeXBlPGFueT4sIGJvb3RzdHJhcENvbXBvbmVudHM6IFR5cGU8YW55PltdLFxuICAgIGRlZkZhY3Rvcnk6IE5nTW9kdWxlRGVmaW5pdGlvbkZhY3RvcnkpOiBOZ01vZHVsZUZhY3Rvcnk8YW55PiB7XG4gIHJldHVybiBuZXcgTmdNb2R1bGVGYWN0b3J5XyhuZ01vZHVsZVR5cGUsIGJvb3RzdHJhcENvbXBvbmVudHMsIGRlZkZhY3RvcnkpO1xufVxuXG5jbGFzcyBOZ01vZHVsZUZhY3RvcnlfIGV4dGVuZHMgTmdNb2R1bGVGYWN0b3J5PGFueT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZWFkb25seSBtb2R1bGVUeXBlOiBUeXBlPGFueT4sIHByaXZhdGUgX2Jvb3RzdHJhcENvbXBvbmVudHM6IFR5cGU8YW55PltdLFxuICAgICAgcHJpdmF0ZSBfbmdNb2R1bGVEZWZGYWN0b3J5OiBOZ01vZHVsZURlZmluaXRpb25GYWN0b3J5KSB7XG4gICAgLy8gQXR0ZW50aW9uOiB0aGlzIGN0b3IgaXMgY2FsbGVkIGFzIHRvcCBsZXZlbCBmdW5jdGlvbi5cbiAgICAvLyBQdXR0aW5nIGFueSBsb2dpYyBpbiBoZXJlIHdpbGwgZGVzdHJveSBjbG9zdXJlIHRyZWUgc2hha2luZyFcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgY3JlYXRlKHBhcmVudEluamVjdG9yOiBJbmplY3RvcnxudWxsKTogTmdNb2R1bGVSZWY8YW55PiB7XG4gICAgaW5pdFNlcnZpY2VzSWZOZWVkZWQoKTtcbiAgICBjb25zdCBkZWYgPSByZXNvbHZlRGVmaW5pdGlvbih0aGlzLl9uZ01vZHVsZURlZkZhY3RvcnkpO1xuICAgIHJldHVybiBTZXJ2aWNlcy5jcmVhdGVOZ01vZHVsZVJlZihcbiAgICAgICAgdGhpcy5tb2R1bGVUeXBlLCBwYXJlbnRJbmplY3RvciB8fCBJbmplY3Rvci5OVUxMLCB0aGlzLl9ib290c3RyYXBDb21wb25lbnRzLCBkZWYpO1xuICB9XG59XG4iXX0=