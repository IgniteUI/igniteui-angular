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
export const /** @type {?} */ ERROR_TYPE = 'ngType';
export const /** @type {?} */ ERROR_DEBUG_CONTEXT = 'ngDebugContext';
export const /** @type {?} */ ERROR_ORIGINAL_ERROR = 'ngOriginalError';
export const /** @type {?} */ ERROR_LOGGER = 'ngErrorLogger';
/**
 * @param {?} error
 * @return {?}
 */
export function getType(error) {
    return (/** @type {?} */ (error))[ERROR_TYPE];
}
/**
 * @param {?} error
 * @return {?}
 */
export function getDebugContext(error) {
    return (/** @type {?} */ (error))[ERROR_DEBUG_CONTEXT];
}
/**
 * @param {?} error
 * @return {?}
 */
export function getOriginalError(error) {
    return (/** @type {?} */ (error))[ERROR_ORIGINAL_ERROR];
}
/**
 * @param {?} error
 * @return {?}
 */
export function getErrorLogger(error) {
    return (/** @type {?} */ (error))[ERROR_LOGGER] || defaultErrorLogger;
}
/**
 * @param {?} console
 * @param {...?} values
 * @return {?}
 */
function defaultErrorLogger(console, ...values) {
    (/** @type {?} */ (console.error))(...values);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsTUFBTSxDQUFDLHVCQUFNLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDbkMsTUFBTSxDQUFDLHVCQUFNLG1CQUFtQixHQUFHLGdCQUFnQixDQUFDO0FBQ3BELE1BQU0sQ0FBQyx1QkFBTSxvQkFBb0IsR0FBRyxpQkFBaUIsQ0FBQztBQUN0RCxNQUFNLENBQUMsdUJBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQzs7Ozs7QUFHNUMsTUFBTSxrQkFBa0IsS0FBWTtJQUNsQyxNQUFNLENBQUMsbUJBQUMsS0FBWSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDbkM7Ozs7O0FBRUQsTUFBTSwwQkFBMEIsS0FBWTtJQUMxQyxNQUFNLENBQUMsbUJBQUMsS0FBWSxFQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQztDQUM1Qzs7Ozs7QUFFRCxNQUFNLDJCQUEyQixLQUFZO0lBQzNDLE1BQU0sQ0FBQyxtQkFBQyxLQUFZLEVBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0NBQzdDOzs7OztBQUVELE1BQU0seUJBQXlCLEtBQVk7SUFDekMsTUFBTSxDQUFDLG1CQUFDLEtBQVksRUFBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLGtCQUFrQixDQUFDO0NBQzNEOzs7Ozs7QUFHRCw0QkFBNEIsT0FBZ0IsRUFBRSxHQUFHLE1BQWE7SUFDNUQsbUJBQU0sT0FBTyxDQUFDLEtBQUssRUFBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7Q0FDakMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGVidWdDb250ZXh0fSBmcm9tICcuL3ZpZXcnO1xuXG5leHBvcnQgY29uc3QgRVJST1JfVFlQRSA9ICduZ1R5cGUnO1xuZXhwb3J0IGNvbnN0IEVSUk9SX0RFQlVHX0NPTlRFWFQgPSAnbmdEZWJ1Z0NvbnRleHQnO1xuZXhwb3J0IGNvbnN0IEVSUk9SX09SSUdJTkFMX0VSUk9SID0gJ25nT3JpZ2luYWxFcnJvcic7XG5leHBvcnQgY29uc3QgRVJST1JfTE9HR0VSID0gJ25nRXJyb3JMb2dnZXInO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlKGVycm9yOiBFcnJvcik6IEZ1bmN0aW9uIHtcbiAgcmV0dXJuIChlcnJvciBhcyBhbnkpW0VSUk9SX1RZUEVdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVidWdDb250ZXh0KGVycm9yOiBFcnJvcik6IERlYnVnQ29udGV4dCB7XG4gIHJldHVybiAoZXJyb3IgYXMgYW55KVtFUlJPUl9ERUJVR19DT05URVhUXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE9yaWdpbmFsRXJyb3IoZXJyb3I6IEVycm9yKTogRXJyb3Ige1xuICByZXR1cm4gKGVycm9yIGFzIGFueSlbRVJST1JfT1JJR0lOQUxfRVJST1JdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXJyb3JMb2dnZXIoZXJyb3I6IEVycm9yKTogKGNvbnNvbGU6IENvbnNvbGUsIC4uLnZhbHVlczogYW55W10pID0+IHZvaWQge1xuICByZXR1cm4gKGVycm9yIGFzIGFueSlbRVJST1JfTE9HR0VSXSB8fCBkZWZhdWx0RXJyb3JMb2dnZXI7XG59XG5cblxuZnVuY3Rpb24gZGVmYXVsdEVycm9yTG9nZ2VyKGNvbnNvbGU6IENvbnNvbGUsIC4uLnZhbHVlczogYW55W10pIHtcbiAgKDxhbnk+Y29uc29sZS5lcnJvcikoLi4udmFsdWVzKTtcbn0iXX0=