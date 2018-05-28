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
 * Store contextual information about a `RouterOutlet`
 *
 *
 */
export class OutletContext {
    constructor() {
        this.outlet = null;
        this.route = null;
        this.resolver = null;
        this.children = new ChildrenOutletContexts();
        this.attachRef = null;
    }
}
function OutletContext_tsickle_Closure_declarations() {
    /** @type {?} */
    OutletContext.prototype.outlet;
    /** @type {?} */
    OutletContext.prototype.route;
    /** @type {?} */
    OutletContext.prototype.resolver;
    /** @type {?} */
    OutletContext.prototype.children;
    /** @type {?} */
    OutletContext.prototype.attachRef;
}
/**
 * Store contextual information about the children (= nested) `RouterOutlet`
 *
 *
 */
export class ChildrenOutletContexts {
    constructor() {
        this.contexts = new Map();
    }
    /**
     * Called when a `RouterOutlet` directive is instantiated
     * @param {?} childName
     * @param {?} outlet
     * @return {?}
     */
    onChildOutletCreated(childName, outlet) {
        const /** @type {?} */ context = this.getOrCreateContext(childName);
        context.outlet = outlet;
        this.contexts.set(childName, context);
    }
    /**
     * Called when a `RouterOutlet` directive is destroyed.
     * We need to keep the context as the outlet could be destroyed inside a NgIf and might be
     * re-created later.
     * @param {?} childName
     * @return {?}
     */
    onChildOutletDestroyed(childName) {
        const /** @type {?} */ context = this.getContext(childName);
        if (context) {
            context.outlet = null;
        }
    }
    /**
     * Called when the corresponding route is deactivated during navigation.
     * Because the component get destroyed, all children outlet are destroyed.
     * @return {?}
     */
    onOutletDeactivated() {
        const /** @type {?} */ contexts = this.contexts;
        this.contexts = new Map();
        return contexts;
    }
    /**
     * @param {?} contexts
     * @return {?}
     */
    onOutletReAttached(contexts) { this.contexts = contexts; }
    /**
     * @param {?} childName
     * @return {?}
     */
    getOrCreateContext(childName) {
        let /** @type {?} */ context = this.getContext(childName);
        if (!context) {
            context = new OutletContext();
            this.contexts.set(childName, context);
        }
        return context;
    }
    /**
     * @param {?} childName
     * @return {?}
     */
    getContext(childName) { return this.contexts.get(childName) || null; }
}
function ChildrenOutletContexts_tsickle_Closure_declarations() {
    /** @type {?} */
    ChildrenOutletContexts.prototype.contexts;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldF9jb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfb3V0bGV0X2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxNQUFNOztzQkFDd0IsSUFBSTtxQkFDSCxJQUFJO3dCQUNTLElBQUk7d0JBQ25DLElBQUksc0JBQXNCLEVBQUU7eUJBQ0gsSUFBSTs7Q0FDekM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9ELE1BQU07O3dCQUVlLElBQUksR0FBRyxFQUF5Qjs7Ozs7Ozs7SUFHbkQsb0JBQW9CLENBQUMsU0FBaUIsRUFBRSxNQUFvQjtRQUMxRCx1QkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUN2Qzs7Ozs7Ozs7SUFPRCxzQkFBc0IsQ0FBQyxTQUFpQjtRQUN0Qyx1QkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ1osT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDdkI7S0FDRjs7Ozs7O0lBTUQsbUJBQW1CO1FBQ2pCLHVCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQixNQUFNLENBQUMsUUFBUSxDQUFDO0tBQ2pCOzs7OztJQUVELGtCQUFrQixDQUFDLFFBQW9DLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsRUFBRTs7Ozs7SUFFdEYsa0JBQWtCLENBQUMsU0FBaUI7UUFDbEMscUJBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2IsT0FBTyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQztLQUNoQjs7Ozs7SUFFRCxVQUFVLENBQUMsU0FBaUIsSUFBd0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO0NBQ25HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGV9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcblxuXG4vKipcbiAqIFN0b3JlIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYWJvdXQgYSBgUm91dGVyT3V0bGV0YFxuICpcbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBPdXRsZXRDb250ZXh0IHtcbiAgb3V0bGV0OiBSb3V0ZXJPdXRsZXR8bnVsbCA9IG51bGw7XG4gIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZXxudWxsID0gbnVsbDtcbiAgcmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcnxudWxsID0gbnVsbDtcbiAgY2hpbGRyZW4gPSBuZXcgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cygpO1xuICBhdHRhY2hSZWY6IENvbXBvbmVudFJlZjxhbnk+fG51bGwgPSBudWxsO1xufVxuXG4vKipcbiAqIFN0b3JlIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNoaWxkcmVuICg9IG5lc3RlZCkgYFJvdXRlck91dGxldGBcbiAqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyB7XG4gIC8vIGNvbnRleHRzIGZvciBjaGlsZCBvdXRsZXRzLCBieSBuYW1lLlxuICBwcml2YXRlIGNvbnRleHRzID0gbmV3IE1hcDxzdHJpbmcsIE91dGxldENvbnRleHQ+KCk7XG5cbiAgLyoqIENhbGxlZCB3aGVuIGEgYFJvdXRlck91dGxldGAgZGlyZWN0aXZlIGlzIGluc3RhbnRpYXRlZCAqL1xuICBvbkNoaWxkT3V0bGV0Q3JlYXRlZChjaGlsZE5hbWU6IHN0cmluZywgb3V0bGV0OiBSb3V0ZXJPdXRsZXQpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5nZXRPckNyZWF0ZUNvbnRleHQoY2hpbGROYW1lKTtcbiAgICBjb250ZXh0Lm91dGxldCA9IG91dGxldDtcbiAgICB0aGlzLmNvbnRleHRzLnNldChjaGlsZE5hbWUsIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgYFJvdXRlck91dGxldGAgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZC5cbiAgICogV2UgbmVlZCB0byBrZWVwIHRoZSBjb250ZXh0IGFzIHRoZSBvdXRsZXQgY291bGQgYmUgZGVzdHJveWVkIGluc2lkZSBhIE5nSWYgYW5kIG1pZ2h0IGJlXG4gICAqIHJlLWNyZWF0ZWQgbGF0ZXIuXG4gICAqL1xuICBvbkNoaWxkT3V0bGV0RGVzdHJveWVkKGNoaWxkTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dChjaGlsZE5hbWUpO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBjb250ZXh0Lm91dGxldCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIHJvdXRlIGlzIGRlYWN0aXZhdGVkIGR1cmluZyBuYXZpZ2F0aW9uLlxuICAgKiBCZWNhdXNlIHRoZSBjb21wb25lbnQgZ2V0IGRlc3Ryb3llZCwgYWxsIGNoaWxkcmVuIG91dGxldCBhcmUgZGVzdHJveWVkLlxuICAgKi9cbiAgb25PdXRsZXREZWFjdGl2YXRlZCgpOiBNYXA8c3RyaW5nLCBPdXRsZXRDb250ZXh0PiB7XG4gICAgY29uc3QgY29udGV4dHMgPSB0aGlzLmNvbnRleHRzO1xuICAgIHRoaXMuY29udGV4dHMgPSBuZXcgTWFwKCk7XG4gICAgcmV0dXJuIGNvbnRleHRzO1xuICB9XG5cbiAgb25PdXRsZXRSZUF0dGFjaGVkKGNvbnRleHRzOiBNYXA8c3RyaW5nLCBPdXRsZXRDb250ZXh0PikgeyB0aGlzLmNvbnRleHRzID0gY29udGV4dHM7IH1cblxuICBnZXRPckNyZWF0ZUNvbnRleHQoY2hpbGROYW1lOiBzdHJpbmcpOiBPdXRsZXRDb250ZXh0IHtcbiAgICBsZXQgY29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dChjaGlsZE5hbWUpO1xuXG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICBjb250ZXh0ID0gbmV3IE91dGxldENvbnRleHQoKTtcbiAgICAgIHRoaXMuY29udGV4dHMuc2V0KGNoaWxkTmFtZSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICBnZXRDb250ZXh0KGNoaWxkTmFtZTogc3RyaW5nKTogT3V0bGV0Q29udGV4dHxudWxsIHsgcmV0dXJuIHRoaXMuY29udGV4dHMuZ2V0KGNoaWxkTmFtZSkgfHwgbnVsbDsgfVxufVxuIl19