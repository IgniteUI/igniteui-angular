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
import * as core from '@angular/core';
import { exportNgVar } from '../util';
const /** @type {?} */ CORE_TOKENS = {
    'ApplicationRef': core.ApplicationRef,
    'NgZone': core.NgZone,
};
const /** @type {?} */ INSPECT_GLOBAL_NAME = 'probe';
const /** @type {?} */ CORE_TOKENS_GLOBAL_NAME = 'coreTokens';
/**
 * Returns a {\@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 * @param {?} element
 * @return {?}
 */
export function inspectNativeElement(element) {
    return core.getDebugNode(element);
}
/**
 * @param {?} coreTokens
 * @return {?}
 */
export function _createNgProbe(coreTokens) {
    exportNgVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
    exportNgVar(CORE_TOKENS_GLOBAL_NAME, Object.assign({}, CORE_TOKENS, _ngProbeTokensToMap(coreTokens || [])));
    return () => inspectNativeElement;
}
/**
 * @param {?} tokens
 * @return {?}
 */
function _ngProbeTokensToMap(tokens) {
    return tokens.reduce((prev, t) => (prev[t.name] = t.token, prev), {});
}
/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const /** @type {?} */ ELEMENT_PROBE_PROVIDERS = [
    {
        provide: core.APP_INITIALIZER,
        useFactory: _createNgProbe,
        deps: [
            [core.NgProbeToken, new core.Optional()],
        ],
        multi: true,
    },
];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcHJvYmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9wbGF0Zm9ybS1icm93c2VyL3NyYy9kb20vZGVidWcvbmdfcHJvYmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEtBQUssSUFBSSxNQUFNLGVBQWUsQ0FBQztBQUN0QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sU0FBUyxDQUFDO0FBRXBDLHVCQUFNLFdBQVcsR0FBRztJQUNsQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsY0FBYztJQUNyQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU07Q0FDdEIsQ0FBQztBQUVGLHVCQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQztBQUNwQyx1QkFBTSx1QkFBdUIsR0FBRyxZQUFZLENBQUM7Ozs7Ozs7O0FBTzdDLE1BQU0sK0JBQStCLE9BQVk7SUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbkM7Ozs7O0FBRUQsTUFBTSx5QkFBeUIsVUFBK0I7SUFDNUQsV0FBVyxDQUFDLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDdkQsV0FBVyxDQUFDLHVCQUF1QixvQkFBTSxXQUFXLEVBQUssbUJBQW1CLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDakcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0NBQ25DOzs7OztBQUVELDZCQUE2QixNQUEyQjtJQUN0RCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQVMsRUFBRSxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ2pGOzs7O0FBS0QsTUFBTSxDQUFDLHVCQUFNLHVCQUF1QixHQUFvQjtJQUN0RDtRQUNFLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZTtRQUM3QixVQUFVLEVBQUUsY0FBYztRQUMxQixJQUFJLEVBQUU7WUFDSixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDekM7UUFDRCxLQUFLLEVBQUUsSUFBSTtLQUNaO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgY29yZSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZXhwb3J0TmdWYXJ9IGZyb20gJy4uL3V0aWwnO1xuXG5jb25zdCBDT1JFX1RPS0VOUyA9IHtcbiAgJ0FwcGxpY2F0aW9uUmVmJzogY29yZS5BcHBsaWNhdGlvblJlZixcbiAgJ05nWm9uZSc6IGNvcmUuTmdab25lLFxufTtcblxuY29uc3QgSU5TUEVDVF9HTE9CQUxfTkFNRSA9ICdwcm9iZSc7XG5jb25zdCBDT1JFX1RPS0VOU19HTE9CQUxfTkFNRSA9ICdjb3JlVG9rZW5zJztcblxuLyoqXG4gKiBSZXR1cm5zIGEge0BsaW5rIERlYnVnRWxlbWVudH0gZm9yIHRoZSBnaXZlbiBuYXRpdmUgRE9NIGVsZW1lbnQsIG9yXG4gKiBudWxsIGlmIHRoZSBnaXZlbiBuYXRpdmUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGFuIEFuZ3VsYXIgdmlldyBhc3NvY2lhdGVkXG4gKiB3aXRoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5zcGVjdE5hdGl2ZUVsZW1lbnQoZWxlbWVudDogYW55KTogY29yZS5EZWJ1Z05vZGV8bnVsbCB7XG4gIHJldHVybiBjb3JlLmdldERlYnVnTm9kZShlbGVtZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9jcmVhdGVOZ1Byb2JlKGNvcmVUb2tlbnM6IGNvcmUuTmdQcm9iZVRva2VuW10pOiBhbnkge1xuICBleHBvcnROZ1ZhcihJTlNQRUNUX0dMT0JBTF9OQU1FLCBpbnNwZWN0TmF0aXZlRWxlbWVudCk7XG4gIGV4cG9ydE5nVmFyKENPUkVfVE9LRU5TX0dMT0JBTF9OQU1FLCB7Li4uQ09SRV9UT0tFTlMsIC4uLl9uZ1Byb2JlVG9rZW5zVG9NYXAoY29yZVRva2VucyB8fCBbXSl9KTtcbiAgcmV0dXJuICgpID0+IGluc3BlY3ROYXRpdmVFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBfbmdQcm9iZVRva2Vuc1RvTWFwKHRva2VuczogY29yZS5OZ1Byb2JlVG9rZW5bXSk6IHtbbmFtZTogc3RyaW5nXTogYW55fSB7XG4gIHJldHVybiB0b2tlbnMucmVkdWNlKChwcmV2OiBhbnksIHQ6IGFueSkgPT4gKHByZXZbdC5uYW1lXSA9IHQudG9rZW4sIHByZXYpLCB7fSk7XG59XG5cbi8qKlxuICogUHJvdmlkZXJzIHdoaWNoIHN1cHBvcnQgZGVidWdnaW5nIEFuZ3VsYXIgYXBwbGljYXRpb25zIChlLmcuIHZpYSBgbmcucHJvYmVgKS5cbiAqL1xuZXhwb3J0IGNvbnN0IEVMRU1FTlRfUFJPQkVfUFJPVklERVJTOiBjb3JlLlByb3ZpZGVyW10gPSBbXG4gIHtcbiAgICBwcm92aWRlOiBjb3JlLkFQUF9JTklUSUFMSVpFUixcbiAgICB1c2VGYWN0b3J5OiBfY3JlYXRlTmdQcm9iZSxcbiAgICBkZXBzOiBbXG4gICAgICBbY29yZS5OZ1Byb2JlVG9rZW4sIG5ldyBjb3JlLk9wdGlvbmFsKCldLFxuICAgIF0sXG4gICAgbXVsdGk6IHRydWUsXG4gIH0sXG5dO1xuIl19