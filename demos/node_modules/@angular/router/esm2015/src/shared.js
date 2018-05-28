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
 * \@description
 *
 * Name of the primary outlet.
 *
 *
 */
export const /** @type {?} */ PRIMARY_OUTLET = 'primary';
/**
 * Matrix and Query parameters.
 *
 * `ParamMap` makes it easier to work with parameters as they could have either a single value or
 * multiple value. Because this should be known by the user, calling `get` or `getAll` returns the
 * correct type (either `string` or `string[]`).
 *
 * The API is inspired by the URLSearchParams interface.
 * see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 *
 *
 * @record
 */
export function ParamMap() { }
function ParamMap_tsickle_Closure_declarations() {
    /** @type {?} */
    ParamMap.prototype.has;
    /**
     * Return a single value for the given parameter name:
     * - the value when the parameter has a single value,
     * - the first value if the parameter has multiple values,
     * - `null` when there is no such parameter.
     * @type {?}
     */
    ParamMap.prototype.get;
    /**
     * Return an array of values for the given parameter name.
     *
     * If there is no such parameter, an empty array is returned.
     * @type {?}
     */
    ParamMap.prototype.getAll;
    /**
     * Name of the parameters
     * @type {?}
     */
    ParamMap.prototype.keys;
}
class ParamsAsMap {
    /**
     * @param {?} params
     */
    constructor(params) { this.params = params || {}; }
    /**
     * @param {?} name
     * @return {?}
     */
    has(name) { return this.params.hasOwnProperty(name); }
    /**
     * @param {?} name
     * @return {?}
     */
    get(name) {
        if (this.has(name)) {
            const /** @type {?} */ v = this.params[name];
            return Array.isArray(v) ? v[0] : v;
        }
        return null;
    }
    /**
     * @param {?} name
     * @return {?}
     */
    getAll(name) {
        if (this.has(name)) {
            const /** @type {?} */ v = this.params[name];
            return Array.isArray(v) ? v : [v];
        }
        return [];
    }
    /**
     * @return {?}
     */
    get keys() { return Object.keys(this.params); }
}
function ParamsAsMap_tsickle_Closure_declarations() {
    /** @type {?} */
    ParamsAsMap.prototype.params;
}
/**
 * Convert a `Params` instance to a `ParamMap`.
 *
 *
 * @param {?} params
 * @return {?}
 */
export function convertToParamMap(params) {
    return new ParamsAsMap(params);
}
const /** @type {?} */ NAVIGATION_CANCELING_ERROR = 'ngNavigationCancelingError';
/**
 * @param {?} message
 * @return {?}
 */
export function navigationCancelingError(message) {
    const /** @type {?} */ error = Error('NavigationCancelingError: ' + message);
    (/** @type {?} */ (error))[NAVIGATION_CANCELING_ERROR] = true;
    return error;
}
/**
 * @param {?} error
 * @return {?}
 */
export function isNavigationCancelingError(error) {
    return error && (/** @type {?} */ (error))[NAVIGATION_CANCELING_ERROR];
}
/**
 * @param {?} segments
 * @param {?} segmentGroup
 * @param {?} route
 * @return {?}
 */
export function defaultUrlMatcher(segments, segmentGroup, route) {
    const /** @type {?} */ parts = /** @type {?} */ ((route.path)).split('/');
    if (parts.length > segments.length) {
        // The actual URL is shorter than the config, no match
        return null;
    }
    if (route.pathMatch === 'full' &&
        (segmentGroup.hasChildren() || parts.length < segments.length)) {
        // The config is longer than the actual URL but we are looking for a full match, return null
        return null;
    }
    const /** @type {?} */ posParams = {};
    // Check each config part against the actual URL
    for (let /** @type {?} */ index = 0; index < parts.length; index++) {
        const /** @type {?} */ part = parts[index];
        const /** @type {?} */ segment = segments[index];
        const /** @type {?} */ isParameter = part.startsWith(':');
        if (isParameter) {
            posParams[part.substring(1)] = segment;
        }
        else if (part !== segment.path) {
            // The actual URL part does not match the config, no match
            return null;
        }
    }
    return { consumed: segments.slice(0, parts.length), posParams };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9zaGFyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLE1BQU0sQ0FBQyx1QkFBTSxjQUFjLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQ3hDOzs7O0lBR0UsWUFBWSxNQUFjLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDLEVBQUU7Ozs7O0lBRTNELEdBQUcsQ0FBQyxJQUFZLElBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7Ozs7O0lBRXZFLEdBQUcsQ0FBQyxJQUFZO1FBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsdUJBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztLQUNiOzs7OztJQUVELE1BQU0sQ0FBQyxJQUFZO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLHVCQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkM7UUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDO0tBQ1g7Ozs7SUFFRCxJQUFJLElBQUksS0FBZSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtDQUMxRDs7Ozs7Ozs7Ozs7O0FBT0QsTUFBTSw0QkFBNEIsTUFBYztJQUM5QyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDaEM7QUFFRCx1QkFBTSwwQkFBMEIsR0FBRyw0QkFBNEIsQ0FBQzs7Ozs7QUFFaEUsTUFBTSxtQ0FBbUMsT0FBZTtJQUN0RCx1QkFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLDRCQUE0QixHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQzVELG1CQUFDLEtBQVksRUFBQyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE1BQU0sQ0FBQyxLQUFLLENBQUM7Q0FDZDs7Ozs7QUFFRCxNQUFNLHFDQUFxQyxLQUFZO0lBQ3JELE1BQU0sQ0FBQyxLQUFLLElBQUksbUJBQUMsS0FBWSxFQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FBQztDQUM1RDs7Ozs7OztBQUdELE1BQU0sNEJBQ0YsUUFBc0IsRUFBRSxZQUE2QixFQUFFLEtBQVk7SUFDckUsdUJBQU0sS0FBSyxzQkFBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOztRQUVuQyxNQUFNLENBQUMsSUFBSSxDQUFDO0tBQ2I7SUFFRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxLQUFLLE1BQU07UUFDMUIsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUVuRSxNQUFNLENBQUMsSUFBSSxDQUFDO0tBQ2I7SUFFRCx1QkFBTSxTQUFTLEdBQWdDLEVBQUUsQ0FBQzs7SUFHbEQsR0FBRyxDQUFDLENBQUMscUJBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ2xELHVCQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsdUJBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyx1QkFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ3hDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7WUFFakMsTUFBTSxDQUFDLElBQUksQ0FBQztTQUNiO0tBQ0Y7SUFFRCxNQUFNLENBQUMsRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBQyxDQUFDO0NBQy9EIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JvdXRlLCBVcmxNYXRjaFJlc3VsdH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtVcmxTZWdtZW50LCBVcmxTZWdtZW50R3JvdXB9IGZyb20gJy4vdXJsX3RyZWUnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogTmFtZSBvZiB0aGUgcHJpbWFyeSBvdXRsZXQuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IFBSSU1BUllfT1VUTEVUID0gJ3ByaW1hcnknO1xuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBwYXJhbWV0ZXJzLlxuICpcbiAqXG4gKi9cbmV4cG9ydCB0eXBlIFBhcmFtcyA9IHtcbiAgW2tleTogc3RyaW5nXTogYW55XG59O1xuXG4vKipcbiAqIE1hdHJpeCBhbmQgUXVlcnkgcGFyYW1ldGVycy5cbiAqXG4gKiBgUGFyYW1NYXBgIG1ha2VzIGl0IGVhc2llciB0byB3b3JrIHdpdGggcGFyYW1ldGVycyBhcyB0aGV5IGNvdWxkIGhhdmUgZWl0aGVyIGEgc2luZ2xlIHZhbHVlIG9yXG4gKiBtdWx0aXBsZSB2YWx1ZS4gQmVjYXVzZSB0aGlzIHNob3VsZCBiZSBrbm93biBieSB0aGUgdXNlciwgY2FsbGluZyBgZ2V0YCBvciBgZ2V0QWxsYCByZXR1cm5zIHRoZVxuICogY29ycmVjdCB0eXBlIChlaXRoZXIgYHN0cmluZ2Agb3IgYHN0cmluZ1tdYCkuXG4gKlxuICogVGhlIEFQSSBpcyBpbnNwaXJlZCBieSB0aGUgVVJMU2VhcmNoUGFyYW1zIGludGVyZmFjZS5cbiAqIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvVVJMU2VhcmNoUGFyYW1zXG4gKlxuICpcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJhbU1hcCB7XG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuO1xuICAvKipcbiAgICogUmV0dXJuIGEgc2luZ2xlIHZhbHVlIGZvciB0aGUgZ2l2ZW4gcGFyYW1ldGVyIG5hbWU6XG4gICAqIC0gdGhlIHZhbHVlIHdoZW4gdGhlIHBhcmFtZXRlciBoYXMgYSBzaW5nbGUgdmFsdWUsXG4gICAqIC0gdGhlIGZpcnN0IHZhbHVlIGlmIHRoZSBwYXJhbWV0ZXIgaGFzIG11bHRpcGxlIHZhbHVlcyxcbiAgICogLSBgbnVsbGAgd2hlbiB0aGVyZSBpcyBubyBzdWNoIHBhcmFtZXRlci5cbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbDtcbiAgLyoqXG4gICAqIFJldHVybiBhbiBhcnJheSBvZiB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwYXJhbWV0ZXIgbmFtZS5cbiAgICpcbiAgICogSWYgdGhlcmUgaXMgbm8gc3VjaCBwYXJhbWV0ZXIsIGFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0QWxsKG5hbWU6IHN0cmluZyk6IHN0cmluZ1tdO1xuXG4gIC8qKiBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJzICovXG4gIHJlYWRvbmx5IGtleXM6IHN0cmluZ1tdO1xufVxuXG5jbGFzcyBQYXJhbXNBc01hcCBpbXBsZW1lbnRzIFBhcmFtTWFwIHtcbiAgcHJpdmF0ZSBwYXJhbXM6IFBhcmFtcztcblxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IFBhcmFtcykgeyB0aGlzLnBhcmFtcyA9IHBhcmFtcyB8fCB7fTsgfVxuXG4gIGhhcyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucGFyYW1zLmhhc093blByb3BlcnR5KG5hbWUpOyB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAodGhpcy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHYgPSB0aGlzLnBhcmFtc1tuYW1lXTtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHYpID8gdlswXSA6IHY7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRBbGwobmFtZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGlmICh0aGlzLmhhcyhuYW1lKSkge1xuICAgICAgY29uc3QgdiA9IHRoaXMucGFyYW1zW25hbWVdO1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodikgPyB2IDogW3ZdO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGdldCBrZXlzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMucGFyYW1zKTsgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBgUGFyYW1zYCBpbnN0YW5jZSB0byBhIGBQYXJhbU1hcGAuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUb1BhcmFtTWFwKHBhcmFtczogUGFyYW1zKTogUGFyYW1NYXAge1xuICByZXR1cm4gbmV3IFBhcmFtc0FzTWFwKHBhcmFtcyk7XG59XG5cbmNvbnN0IE5BVklHQVRJT05fQ0FOQ0VMSU5HX0VSUk9SID0gJ25nTmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRpb25DYW5jZWxpbmdFcnJvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgY29uc3QgZXJyb3IgPSBFcnJvcignTmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yOiAnICsgbWVzc2FnZSk7XG4gIChlcnJvciBhcyBhbnkpW05BVklHQVRJT05fQ0FOQ0VMSU5HX0VSUk9SXSA9IHRydWU7XG4gIHJldHVybiBlcnJvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmF2aWdhdGlvbkNhbmNlbGluZ0Vycm9yKGVycm9yOiBFcnJvcikge1xuICByZXR1cm4gZXJyb3IgJiYgKGVycm9yIGFzIGFueSlbTkFWSUdBVElPTl9DQU5DRUxJTkdfRVJST1JdO1xufVxuXG4vLyBNYXRjaGVzIHRoZSByb3V0ZSBjb25maWd1cmF0aW9uIChgcm91dGVgKSBhZ2FpbnN0IHRoZSBhY3R1YWwgVVJMIChgc2VnbWVudHNgKS5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0VXJsTWF0Y2hlcihcbiAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCwgcm91dGU6IFJvdXRlKTogVXJsTWF0Y2hSZXN1bHR8bnVsbCB7XG4gIGNvbnN0IHBhcnRzID0gcm91dGUucGF0aCAhLnNwbGl0KCcvJyk7XG5cbiAgaWYgKHBhcnRzLmxlbmd0aCA+IHNlZ21lbnRzLmxlbmd0aCkge1xuICAgIC8vIFRoZSBhY3R1YWwgVVJMIGlzIHNob3J0ZXIgdGhhbiB0aGUgY29uZmlnLCBubyBtYXRjaFxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHJvdXRlLnBhdGhNYXRjaCA9PT0gJ2Z1bGwnICYmXG4gICAgICAoc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkgfHwgcGFydHMubGVuZ3RoIDwgc2VnbWVudHMubGVuZ3RoKSkge1xuICAgIC8vIFRoZSBjb25maWcgaXMgbG9uZ2VyIHRoYW4gdGhlIGFjdHVhbCBVUkwgYnV0IHdlIGFyZSBsb29raW5nIGZvciBhIGZ1bGwgbWF0Y2gsIHJldHVybiBudWxsXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBwb3NQYXJhbXM6IHtba2V5OiBzdHJpbmddOiBVcmxTZWdtZW50fSA9IHt9O1xuXG4gIC8vIENoZWNrIGVhY2ggY29uZmlnIHBhcnQgYWdhaW5zdCB0aGUgYWN0dWFsIFVSTFxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgcGFydHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY29uc3QgcGFydCA9IHBhcnRzW2luZGV4XTtcbiAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbaW5kZXhdO1xuICAgIGNvbnN0IGlzUGFyYW1ldGVyID0gcGFydC5zdGFydHNXaXRoKCc6Jyk7XG4gICAgaWYgKGlzUGFyYW1ldGVyKSB7XG4gICAgICBwb3NQYXJhbXNbcGFydC5zdWJzdHJpbmcoMSldID0gc2VnbWVudDtcbiAgICB9IGVsc2UgaWYgKHBhcnQgIT09IHNlZ21lbnQucGF0aCkge1xuICAgICAgLy8gVGhlIGFjdHVhbCBVUkwgcGFydCBkb2VzIG5vdCBtYXRjaCB0aGUgY29uZmlnLCBubyBtYXRjaFxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtjb25zdW1lZDogc2VnbWVudHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoKSwgcG9zUGFyYW1zfTtcbn1cbiJdfQ==