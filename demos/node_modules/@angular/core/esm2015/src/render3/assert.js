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
// The functions in this file verify that the assumptions we are making
// about state in an instruction are correct before implementing any logic.
// They are meant only to be called in dev mode as sanity checks.
/**
 * @param {?} actual
 * @param {?} msg
 * @return {?}
 */
export function assertNumber(actual, msg) {
    if (typeof actual != 'number') {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} expected
 * @param {?} msg
 * @return {?}
 */
export function assertEqual(actual, expected, msg) {
    if (actual != expected) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} expected
 * @param {?} msg
 * @return {?}
 */
export function assertNotEqual(actual, expected, msg) {
    if (actual == expected) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} expected
 * @param {?} msg
 * @return {?}
 */
export function assertSame(actual, expected, msg) {
    if (actual !== expected) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} expected
 * @param {?} msg
 * @return {?}
 */
export function assertLessThan(actual, expected, msg) {
    if (actual >= expected) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} expected
 * @param {?} msg
 * @return {?}
 */
export function assertGreaterThan(actual, expected, msg) {
    if (actual <= expected) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} msg
 * @return {?}
 */
export function assertNull(actual, msg) {
    if (actual != null) {
        throwError(msg);
    }
}
/**
 * @template T
 * @param {?} actual
 * @param {?} msg
 * @return {?}
 */
export function assertNotNull(actual, msg) {
    if (actual == null) {
        throwError(msg);
    }
}
/**
 * @param {?} actual
 * @param {?=} msg
 * @return {?}
 */
export function assertComponentType(actual, msg = 'Type passed in is not ComponentType, it does not have \'ngComponentDef\' property.') {
    if (!actual.ngComponentDef) {
        throwError(msg);
    }
}
/**
 * @param {?} msg
 * @return {?}
 */
function throwError(msg) {
    debugger; // Left intentionally for better debugger experience.
    throw new Error(`ASSERTION ERROR: ${msg}`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy9hc3NlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVlBLE1BQU0sdUJBQXVCLE1BQVcsRUFBRSxHQUFXO0lBQ25ELEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0NBQ0Y7Ozs7Ozs7O0FBRUQsTUFBTSxzQkFBeUIsTUFBUyxFQUFFLFFBQVcsRUFBRSxHQUFXO0lBQ2hFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQjtDQUNGOzs7Ozs7OztBQUVELE1BQU0seUJBQTRCLE1BQVMsRUFBRSxRQUFXLEVBQUUsR0FBVztJQUNuRSxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2QixVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakI7Q0FDRjs7Ozs7Ozs7QUFFRCxNQUFNLHFCQUF3QixNQUFTLEVBQUUsUUFBVyxFQUFFLEdBQVc7SUFDL0QsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0NBQ0Y7Ozs7Ozs7O0FBRUQsTUFBTSx5QkFBNEIsTUFBUyxFQUFFLFFBQVcsRUFBRSxHQUFXO0lBQ25FLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQjtDQUNGOzs7Ozs7OztBQUVELE1BQU0sNEJBQStCLE1BQVMsRUFBRSxRQUFXLEVBQUUsR0FBVztJQUN0RSxFQUFFLENBQUMsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2QixVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakI7Q0FDRjs7Ozs7OztBQUVELE1BQU0scUJBQXdCLE1BQVMsRUFBRSxHQUFXO0lBQ2xELEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQjtDQUNGOzs7Ozs7O0FBRUQsTUFBTSx3QkFBMkIsTUFBUyxFQUFFLEdBQVc7SUFDckQsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0NBQ0Y7Ozs7OztBQUVELE1BQU0sOEJBQ0YsTUFBVyxFQUNYLE1BQ0ksb0ZBQW9GO0lBQzFGLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0NBQ0Y7Ozs7O0FBRUQsb0JBQW9CLEdBQVc7SUFDN0IsUUFBUSxDQUFDO0lBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztDQUM1QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVGhlIGZ1bmN0aW9ucyBpbiB0aGlzIGZpbGUgdmVyaWZ5IHRoYXQgdGhlIGFzc3VtcHRpb25zIHdlIGFyZSBtYWtpbmdcbi8vIGFib3V0IHN0YXRlIGluIGFuIGluc3RydWN0aW9uIGFyZSBjb3JyZWN0IGJlZm9yZSBpbXBsZW1lbnRpbmcgYW55IGxvZ2ljLlxuLy8gVGhleSBhcmUgbWVhbnQgb25seSB0byBiZSBjYWxsZWQgaW4gZGV2IG1vZGUgYXMgc2FuaXR5IGNoZWNrcy5cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE51bWJlcihhY3R1YWw6IGFueSwgbXNnOiBzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBhY3R1YWwgIT0gJ251bWJlcicpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEVxdWFsPFQ+KGFjdHVhbDogVCwgZXhwZWN0ZWQ6IFQsIG1zZzogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdEVxdWFsPFQ+KGFjdHVhbDogVCwgZXhwZWN0ZWQ6IFQsIG1zZzogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFNhbWU8VD4oYWN0dWFsOiBULCBleHBlY3RlZDogVCwgbXNnOiBzdHJpbmcpIHtcbiAgaWYgKGFjdHVhbCAhPT0gZXhwZWN0ZWQpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydExlc3NUaGFuPFQ+KGFjdHVhbDogVCwgZXhwZWN0ZWQ6IFQsIG1zZzogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgPj0gZXhwZWN0ZWQpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEdyZWF0ZXJUaGFuPFQ+KGFjdHVhbDogVCwgZXhwZWN0ZWQ6IFQsIG1zZzogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgPD0gZXhwZWN0ZWQpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE51bGw8VD4oYWN0dWFsOiBULCBtc2c6IHN0cmluZykge1xuICBpZiAoYWN0dWFsICE9IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5vdE51bGw8VD4oYWN0dWFsOiBULCBtc2c6IHN0cmluZykge1xuICBpZiAoYWN0dWFsID09IG51bGwpIHtcbiAgICB0aHJvd0Vycm9yKG1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydENvbXBvbmVudFR5cGUoXG4gICAgYWN0dWFsOiBhbnksXG4gICAgbXNnOiBzdHJpbmcgPVxuICAgICAgICAnVHlwZSBwYXNzZWQgaW4gaXMgbm90IENvbXBvbmVudFR5cGUsIGl0IGRvZXMgbm90IGhhdmUgXFwnbmdDb21wb25lbnREZWZcXCcgcHJvcGVydHkuJykge1xuICBpZiAoIWFjdHVhbC5uZ0NvbXBvbmVudERlZikge1xuICAgIHRocm93RXJyb3IobXNnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aHJvd0Vycm9yKG1zZzogc3RyaW5nKTogbmV2ZXIge1xuICBkZWJ1Z2dlcjsgIC8vIExlZnQgaW50ZW50aW9uYWxseSBmb3IgYmV0dGVyIGRlYnVnZ2VyIGV4cGVyaWVuY2UuXG4gIHRocm93IG5ldyBFcnJvcihgQVNTRVJUSU9OIEVSUk9SOiAke21zZ31gKTtcbn0iXX0=