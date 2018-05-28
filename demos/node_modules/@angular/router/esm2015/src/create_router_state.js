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
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, RouterState } from './router_state';
import { TreeNode } from './utils/tree';
/**
 * @param {?} routeReuseStrategy
 * @param {?} curr
 * @param {?} prevState
 * @return {?}
 */
export function createRouterState(routeReuseStrategy, curr, prevState) {
    const /** @type {?} */ root = createNode(routeReuseStrategy, curr._root, prevState ? prevState._root : undefined);
    return new RouterState(root, curr);
}
/**
 * @param {?} routeReuseStrategy
 * @param {?} curr
 * @param {?=} prevState
 * @return {?}
 */
function createNode(routeReuseStrategy, curr, prevState) {
    // reuse an activated route that is currently displayed on the screen
    if (prevState && routeReuseStrategy.shouldReuseRoute(curr.value, prevState.value.snapshot)) {
        const /** @type {?} */ value = prevState.value;
        value._futureSnapshot = curr.value;
        const /** @type {?} */ children = createOrReuseChildren(routeReuseStrategy, curr, prevState);
        return new TreeNode(value, children);
        // retrieve an activated route that is used to be displayed, but is not currently displayed
    }
    else {
        const /** @type {?} */ detachedRouteHandle = /** @type {?} */ (routeReuseStrategy.retrieve(curr.value));
        if (detachedRouteHandle) {
            const /** @type {?} */ tree = detachedRouteHandle.route;
            setFutureSnapshotsOfActivatedRoutes(curr, tree);
            return tree;
        }
        else {
            const /** @type {?} */ value = createActivatedRoute(curr.value);
            const /** @type {?} */ children = curr.children.map(c => createNode(routeReuseStrategy, c));
            return new TreeNode(value, children);
        }
    }
}
/**
 * @param {?} curr
 * @param {?} result
 * @return {?}
 */
function setFutureSnapshotsOfActivatedRoutes(curr, result) {
    if (curr.value.routeConfig !== result.value.routeConfig) {
        throw new Error('Cannot reattach ActivatedRouteSnapshot created from a different route');
    }
    if (curr.children.length !== result.children.length) {
        throw new Error('Cannot reattach ActivatedRouteSnapshot with a different number of children');
    }
    result.value._futureSnapshot = curr.value;
    for (let /** @type {?} */ i = 0; i < curr.children.length; ++i) {
        setFutureSnapshotsOfActivatedRoutes(curr.children[i], result.children[i]);
    }
}
/**
 * @param {?} routeReuseStrategy
 * @param {?} curr
 * @param {?} prevState
 * @return {?}
 */
function createOrReuseChildren(routeReuseStrategy, curr, prevState) {
    return curr.children.map(child => {
        for (const /** @type {?} */ p of prevState.children) {
            if (routeReuseStrategy.shouldReuseRoute(p.value.snapshot, child.value)) {
                return createNode(routeReuseStrategy, child, p);
            }
        }
        return createNode(routeReuseStrategy, child);
    });
}
/**
 * @param {?} c
 * @return {?}
 */
function createActivatedRoute(c) {
    return new ActivatedRoute(new BehaviorSubject(c.url), new BehaviorSubject(c.params), new BehaviorSubject(c.queryParams), new BehaviorSubject(c.fragment), new BehaviorSubject(c.data), c.outlet, c.component, c);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX3JvdXRlcl9zdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci9zcmMvY3JlYXRlX3JvdXRlcl9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHckMsT0FBTyxFQUFDLGNBQWMsRUFBMEIsV0FBVyxFQUFzQixNQUFNLGdCQUFnQixDQUFDO0FBQ3hHLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7Ozs7QUFFdEMsTUFBTSw0QkFDRixrQkFBc0MsRUFBRSxJQUF5QixFQUNqRSxTQUFzQjtJQUN4Qix1QkFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqRyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3BDOzs7Ozs7O0FBRUQsb0JBQ0ksa0JBQXNDLEVBQUUsSUFBc0MsRUFDOUUsU0FBb0M7O0lBRXRDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLHVCQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQzlCLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNuQyx1QkFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVFLE1BQU0sQ0FBQyxJQUFJLFFB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Q0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzdGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RGV0YWNoZWRSb3V0ZUhhbmRsZUludGVybmFsLCBSb3V0ZVJldXNlU3RyYXRlZ3l9IGZyb20gJy4vcm91dGVfcmV1c2Vfc3RyYXRlZ3knO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZSwgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgUm91dGVyU3RhdGUsIFJvdXRlclN0YXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7VHJlZU5vZGV9IGZyb20gJy4vdXRpbHMvdHJlZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSb3V0ZXJTdGF0ZShcbiAgICByb3V0ZVJldXNlU3RyYXRlZ3k6IFJvdXRlUmV1c2VTdHJhdGVneSwgY3VycjogUm91dGVyU3RhdGVTbmFwc2hvdCxcbiAgICBwcmV2U3RhdGU6IFJvdXRlclN0YXRlKTogUm91dGVyU3RhdGUge1xuICBjb25zdCByb290ID0gY3JlYXRlTm9kZShyb3V0ZVJldXNlU3RyYXRlZ3ksIGN1cnIuX3Jvb3QsIHByZXZTdGF0ZSA/IHByZXZTdGF0ZS5fcm9vdCA6IHVuZGVmaW5lZCk7XG4gIHJldHVybiBuZXcgUm91dGVyU3RhdGUocm9vdCwgY3Vycik7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vZGUoXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5OiBSb3V0ZVJldXNlU3RyYXRlZ3ksIGN1cnI6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LFxuICAgIHByZXZTdGF0ZT86IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPik6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPiB7XG4gIC8vIHJldXNlIGFuIGFjdGl2YXRlZCByb3V0ZSB0aGF0IGlzIGN1cnJlbnRseSBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlblxuICBpZiAocHJldlN0YXRlICYmIHJvdXRlUmV1c2VTdHJhdGVneS5zaG91bGRSZXVzZVJvdXRlKGN1cnIudmFsdWUsIHByZXZTdGF0ZS52YWx1ZS5zbmFwc2hvdCkpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHByZXZTdGF0ZS52YWx1ZTtcbiAgICB2YWx1ZS5fZnV0dXJlU25hcHNob3QgPSBjdXJyLnZhbHVlO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gY3JlYXRlT3JSZXVzZUNoaWxkcmVuKHJvdXRlUmV1c2VTdHJhdGVneSwgY3VyciwgcHJldlN0YXRlKTtcbiAgICByZXR1cm4gbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPih2YWx1ZSwgY2hpbGRyZW4pO1xuXG4gICAgLy8gcmV0cmlldmUgYW4gYWN0aXZhdGVkIHJvdXRlIHRoYXQgaXMgdXNlZCB0byBiZSBkaXNwbGF5ZWQsIGJ1dCBpcyBub3QgY3VycmVudGx5IGRpc3BsYXllZFxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRldGFjaGVkUm91dGVIYW5kbGUgPVxuICAgICAgICA8RGV0YWNoZWRSb3V0ZUhhbmRsZUludGVybmFsPnJvdXRlUmV1c2VTdHJhdGVneS5yZXRyaWV2ZShjdXJyLnZhbHVlKTtcbiAgICBpZiAoZGV0YWNoZWRSb3V0ZUhhbmRsZSkge1xuICAgICAgY29uc3QgdHJlZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+ID0gZGV0YWNoZWRSb3V0ZUhhbmRsZS5yb3V0ZTtcbiAgICAgIHNldEZ1dHVyZVNuYXBzaG90c09mQWN0aXZhdGVkUm91dGVzKGN1cnIsIHRyZWUpO1xuICAgICAgcmV0dXJuIHRyZWU7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdmFsdWUgPSBjcmVhdGVBY3RpdmF0ZWRSb3V0ZShjdXJyLnZhbHVlKTtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gY3Vyci5jaGlsZHJlbi5tYXAoYyA9PiBjcmVhdGVOb2RlKHJvdXRlUmV1c2VTdHJhdGVneSwgYykpO1xuICAgICAgcmV0dXJuIG5ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4odmFsdWUsIGNoaWxkcmVuKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0RnV0dXJlU25hcHNob3RzT2ZBY3RpdmF0ZWRSb3V0ZXMoXG4gICAgY3VycjogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sIHJlc3VsdDogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+KTogdm9pZCB7XG4gIGlmIChjdXJyLnZhbHVlLnJvdXRlQ29uZmlnICE9PSByZXN1bHQudmFsdWUucm91dGVDb25maWcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZWF0dGFjaCBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IGNyZWF0ZWQgZnJvbSBhIGRpZmZlcmVudCByb3V0ZScpO1xuICB9XG4gIGlmIChjdXJyLmNoaWxkcmVuLmxlbmd0aCAhPT0gcmVzdWx0LmNoaWxkcmVuLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlYXR0YWNoIEFjdGl2YXRlZFJvdXRlU25hcHNob3Qgd2l0aCBhIGRpZmZlcmVudCBudW1iZXIgb2YgY2hpbGRyZW4nKTtcbiAgfVxuICByZXN1bHQudmFsdWUuX2Z1dHVyZVNuYXBzaG90ID0gY3Vyci52YWx1ZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXJyLmNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgc2V0RnV0dXJlU25hcHNob3RzT2ZBY3RpdmF0ZWRSb3V0ZXMoY3Vyci5jaGlsZHJlbltpXSwgcmVzdWx0LmNoaWxkcmVuW2ldKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVPclJldXNlQ2hpbGRyZW4oXG4gICAgcm91dGVSZXVzZVN0cmF0ZWd5OiBSb3V0ZVJldXNlU3RyYXRlZ3ksIGN1cnI6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LFxuICAgIHByZXZTdGF0ZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+KSB7XG4gIHJldHVybiBjdXJyLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHByZXZTdGF0ZS5jaGlsZHJlbikge1xuICAgICAgaWYgKHJvdXRlUmV1c2VTdHJhdGVneS5zaG91bGRSZXVzZVJvdXRlKHAudmFsdWUuc25hcHNob3QsIGNoaWxkLnZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlTm9kZShyb3V0ZVJldXNlU3RyYXRlZ3ksIGNoaWxkLCBwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZU5vZGUocm91dGVSZXVzZVN0cmF0ZWd5LCBjaGlsZCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBY3RpdmF0ZWRSb3V0ZShjOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7XG4gIHJldHVybiBuZXcgQWN0aXZhdGVkUm91dGUoXG4gICAgICBuZXcgQmVoYXZpb3JTdWJqZWN0KGMudXJsKSwgbmV3IEJlaGF2aW9yU3ViamVjdChjLnBhcmFtcyksIG5ldyBCZWhhdmlvclN1YmplY3QoYy5xdWVyeVBhcmFtcyksXG4gICAgICBuZXcgQmVoYXZpb3JTdWJqZWN0KGMuZnJhZ21lbnQpLCBuZXcgQmVoYXZpb3JTdWJqZWN0KGMuZGF0YSksIGMub3V0bGV0LCBjLmNvbXBvbmVudCwgYyk7XG59XG4iXX0=