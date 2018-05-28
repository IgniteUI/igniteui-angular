/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { checkNoChanges, detectChanges, markViewDirty } from './instructions';
import { notImplemented } from './util';
var ViewRef = /** @class */ (function () {
    function ViewRef(_view, context) {
        this._view = _view;
        this.context = (context);
    }
    /** @internal */
    /** @internal */
    ViewRef.prototype._setComponentContext = /** @internal */
    function (view, context) {
        this._view = view;
        this.context = context;
    };
    ViewRef.prototype.destroy = function () { notImplemented(); };
    ViewRef.prototype.onDestroy = function (callback) { notImplemented(); };
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * It also triggers change detection by calling `scheduleTick` internally, which coalesces
     * multiple `markForCheck` calls to into one change detection run.
     *
     * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
     * checked when it needs to be re-rendered but the two normal triggers haven't marked it
     * dirty (i.e. inputs haven't changed and events haven't fired in the view).
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     * ### Example ([live demo](https://stackblitz.com/edit/angular-kx7rrw))
     *
     * ```typescript
     * @Component({
     *   selector: 'my-app',
     *   template: `Number of ticks: {{numberOfTicks}}`
     *   changeDetection: ChangeDetectionStrategy.OnPush,
     * })
     * class AppComponent {
     *   numberOfTicks = 0;
     *
     *   constructor(private ref: ChangeDetectorRef) {
     *     setInterval(() => {
     *       this.numberOfTicks++;
     *       // the following is required, otherwise the view will not be updated
     *       this.ref.markForCheck();
     *     }, 1000);
     *   }
     * }
     * ```
     */
    /**
       * Marks a view and all of its ancestors dirty.
       *
       * It also triggers change detection by calling `scheduleTick` internally, which coalesces
       * multiple `markForCheck` calls to into one change detection run.
       *
       * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
       * checked when it needs to be re-rendered but the two normal triggers haven't marked it
       * dirty (i.e. inputs haven't changed and events haven't fired in the view).
       *
       * <!-- TODO: Add a link to a chapter on OnPush components -->
       *
       * ### Example ([live demo](https://stackblitz.com/edit/angular-kx7rrw))
       *
       * ```typescript
       * @Component({
       *   selector: 'my-app',
       *   template: `Number of ticks: {{numberOfTicks}}`
       *   changeDetection: ChangeDetectionStrategy.OnPush,
       * })
       * class AppComponent {
       *   numberOfTicks = 0;
       *
       *   constructor(private ref: ChangeDetectorRef) {
       *     setInterval(() => {
       *       this.numberOfTicks++;
       *       // the following is required, otherwise the view will not be updated
       *       this.ref.markForCheck();
       *     }, 1000);
       *   }
       * }
       * ```
       */
    ViewRef.prototype.markForCheck = /**
       * Marks a view and all of its ancestors dirty.
       *
       * It also triggers change detection by calling `scheduleTick` internally, which coalesces
       * multiple `markForCheck` calls to into one change detection run.
       *
       * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush OnPush} component is
       * checked when it needs to be re-rendered but the two normal triggers haven't marked it
       * dirty (i.e. inputs haven't changed and events haven't fired in the view).
       *
       * <!-- TODO: Add a link to a chapter on OnPush components -->
       *
       * ### Example ([live demo](https://stackblitz.com/edit/angular-kx7rrw))
       *
       * ```typescript
       * @Component({
       *   selector: 'my-app',
       *   template: `Number of ticks: {{numberOfTicks}}`
       *   changeDetection: ChangeDetectionStrategy.OnPush,
       * })
       * class AppComponent {
       *   numberOfTicks = 0;
       *
       *   constructor(private ref: ChangeDetectorRef) {
       *     setInterval(() => {
       *       this.numberOfTicks++;
       *       // the following is required, otherwise the view will not be updated
       *       this.ref.markForCheck();
       *     }, 1000);
       *   }
       * }
       * ```
       */
    function () { markViewDirty(this._view); };
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
     * detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds. We can do that by detaching
     * the component's change detector and doing a local check every five seconds.
     *
     * ```typescript
     * class DataProvider {
     *   // in a real application the returned data will be different every time
     *   get data() {
     *     return [1,2,3,4,5];
     *   }
     * }
     *
     * @Component({
     *   selector: 'giant-list',
     *   template: `
     *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
     *   `,
     * })
     * class GiantList {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
     *     ref.detach();
     *     setInterval(() => {
     *       this.ref.detectChanges();
     *     }, 5000);
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   providers: [DataProvider],
     *   template: `
     *     <giant-list><giant-list>
     *   `,
     * })
     * class App {
     * }
     * ```
     */
    /**
       * Detaches the view from the change detection tree.
       *
       * Detached views will not be checked during change detection runs until they are
       * re-attached, even if they are dirty. `detach` can be used in combination with
       * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
       * detection checks.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
       *
       * ### Example
       *
       * The following example defines a component with a large list of readonly data.
       * Imagine the data changes constantly, many times per second. For performance reasons,
       * we want to check and update the list every five seconds. We can do that by detaching
       * the component's change detector and doing a local check every five seconds.
       *
       * ```typescript
       * class DataProvider {
       *   // in a real application the returned data will be different every time
       *   get data() {
       *     return [1,2,3,4,5];
       *   }
       * }
       *
       * @Component({
       *   selector: 'giant-list',
       *   template: `
       *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
       *   `,
       * })
       * class GiantList {
       *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
       *     ref.detach();
       *     setInterval(() => {
       *       this.ref.detectChanges();
       *     }, 5000);
       *   }
       * }
       *
       * @Component({
       *   selector: 'app',
       *   providers: [DataProvider],
       *   template: `
       *     <giant-list><giant-list>
       *   `,
       * })
       * class App {
       * }
       * ```
       */
    ViewRef.prototype.detach = /**
       * Detaches the view from the change detection tree.
       *
       * Detached views will not be checked during change detection runs until they are
       * re-attached, even if they are dirty. `detach` can be used in combination with
       * {@link ChangeDetectorRef#detectChanges detectChanges} to implement local change
       * detection checks.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
       *
       * ### Example
       *
       * The following example defines a component with a large list of readonly data.
       * Imagine the data changes constantly, many times per second. For performance reasons,
       * we want to check and update the list every five seconds. We can do that by detaching
       * the component's change detector and doing a local check every five seconds.
       *
       * ```typescript
       * class DataProvider {
       *   // in a real application the returned data will be different every time
       *   get data() {
       *     return [1,2,3,4,5];
       *   }
       * }
       *
       * @Component({
       *   selector: 'giant-list',
       *   template: `
       *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
       *   `,
       * })
       * class GiantList {
       *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
       *     ref.detach();
       *     setInterval(() => {
       *       this.ref.detectChanges();
       *     }, 5000);
       *   }
       * }
       *
       * @Component({
       *   selector: 'app',
       *   providers: [DataProvider],
       *   template: `
       *     <giant-list><giant-list>
       *   `,
       * })
       * class App {
       * }
       * ```
       */
    function () { this._view.flags &= ~8 /* Attached */; };
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     * ### Example ([live demo](https://stackblitz.com/edit/angular-ymgsxw))
     *
     * The following example creates a component displaying `live` data. The component will detach
     * its change detector from the main change detector tree when the component's live property
     * is set to false.
     *
     * ```typescript
     * class DataProvider {
     *   data = 1;
     *
     *   constructor() {
     *     setInterval(() => {
     *       this.data = this.data * 2;
     *     }, 500);
     *   }
     * }
     *
     * @Component({
     *   selector: 'live-data',
     *   inputs: ['live'],
     *   template: 'Data: {{dataProvider.data}}'
     * })
     * class LiveData {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
     *
     *   set live(value) {
     *     if (value) {
     *       this.ref.reattach();
     *     } else {
     *       this.ref.detach();
     *     }
     *   }
     * }
     *
     * @Component({
     *   selector: 'my-app',
     *   providers: [DataProvider],
     *   template: `
     *     Live Update: <input type="checkbox" [(ngModel)]="live">
     *     <live-data [live]="live"><live-data>
     *   `,
     * })
     * class AppComponent {
     *   live = true;
     * }
     * ```
     */
    /**
       * Re-attaches a view to the change detection tree.
       *
       * This can be used to re-attach views that were previously detached from the tree
       * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       *
       * ### Example ([live demo](https://stackblitz.com/edit/angular-ymgsxw))
       *
       * The following example creates a component displaying `live` data. The component will detach
       * its change detector from the main change detector tree when the component's live property
       * is set to false.
       *
       * ```typescript
       * class DataProvider {
       *   data = 1;
       *
       *   constructor() {
       *     setInterval(() => {
       *       this.data = this.data * 2;
       *     }, 500);
       *   }
       * }
       *
       * @Component({
       *   selector: 'live-data',
       *   inputs: ['live'],
       *   template: 'Data: {{dataProvider.data}}'
       * })
       * class LiveData {
       *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
       *
       *   set live(value) {
       *     if (value) {
       *       this.ref.reattach();
       *     } else {
       *       this.ref.detach();
       *     }
       *   }
       * }
       *
       * @Component({
       *   selector: 'my-app',
       *   providers: [DataProvider],
       *   template: `
       *     Live Update: <input type="checkbox" [(ngModel)]="live">
       *     <live-data [live]="live"><live-data>
       *   `,
       * })
       * class AppComponent {
       *   live = true;
       * }
       * ```
       */
    ViewRef.prototype.reattach = /**
       * Re-attaches a view to the change detection tree.
       *
       * This can be used to re-attach views that were previously detached from the tree
       * using {@link ChangeDetectorRef#detach detach}. Views are attached to the tree by default.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       *
       * ### Example ([live demo](https://stackblitz.com/edit/angular-ymgsxw))
       *
       * The following example creates a component displaying `live` data. The component will detach
       * its change detector from the main change detector tree when the component's live property
       * is set to false.
       *
       * ```typescript
       * class DataProvider {
       *   data = 1;
       *
       *   constructor() {
       *     setInterval(() => {
       *       this.data = this.data * 2;
       *     }, 500);
       *   }
       * }
       *
       * @Component({
       *   selector: 'live-data',
       *   inputs: ['live'],
       *   template: 'Data: {{dataProvider.data}}'
       * })
       * class LiveData {
       *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
       *
       *   set live(value) {
       *     if (value) {
       *       this.ref.reattach();
       *     } else {
       *       this.ref.detach();
       *     }
       *   }
       * }
       *
       * @Component({
       *   selector: 'my-app',
       *   providers: [DataProvider],
       *   template: `
       *     Live Update: <input type="checkbox" [(ngModel)]="live">
       *     <live-data [live]="live"><live-data>
       *   `,
       * })
       * class AppComponent {
       *   live = true;
       * }
       * ```
       */
    function () { this._view.flags |= 8 /* Attached */; };
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
     * local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine, the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds.
     *
     * We can do that by detaching the component's change detector and doing a local change detection
     * check every five seconds.
     *
     * See {@link ChangeDetectorRef#detach detach} for more information.
     */
    /**
       * Checks the view and its children.
       *
       * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
       * local change detection checks.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
       *
       * ### Example
       *
       * The following example defines a component with a large list of readonly data.
       * Imagine, the data changes constantly, many times per second. For performance reasons,
       * we want to check and update the list every five seconds.
       *
       * We can do that by detaching the component's change detector and doing a local change detection
       * check every five seconds.
       *
       * See {@link ChangeDetectorRef#detach detach} for more information.
       */
    ViewRef.prototype.detectChanges = /**
       * Checks the view and its children.
       *
       * This can also be used in combination with {@link ChangeDetectorRef#detach detach} to implement
       * local change detection checks.
       *
       * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
       * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
       *
       * ### Example
       *
       * The following example defines a component with a large list of readonly data.
       * Imagine, the data changes constantly, many times per second. For performance reasons,
       * we want to check and update the list every five seconds.
       *
       * We can do that by detaching the component's change detector and doing a local change detection
       * check every five seconds.
       *
       * See {@link ChangeDetectorRef#detach detach} for more information.
       */
    function () { detectChanges(this.context); };
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     */
    /**
       * Checks the change detector and its children, and throws if any changes are detected.
       *
       * This is used in development mode to verify that running change detection doesn't
       * introduce other changes.
       */
    ViewRef.prototype.checkNoChanges = /**
       * Checks the change detector and its children, and throws if any changes are detected.
       *
       * This is used in development mode to verify that running change detection doesn't
       * introduce other changes.
       */
    function () { checkNoChanges(this.context); };
    return ViewRef;
}());
export { ViewRef };
var EmbeddedViewRef = /** @class */ (function (_super) {
    tslib_1.__extends(EmbeddedViewRef, _super);
    function EmbeddedViewRef(viewNode, template, context) {
        var _this = _super.call(this, viewNode.data, context) || this;
        _this._lViewNode = viewNode;
        return _this;
    }
    return EmbeddedViewRef;
}(ViewRef));
export { EmbeddedViewRef };
/**
 * Creates a ViewRef bundled with destroy functionality.
 *
 * @param context The context for this view
 * @returns The ViewRef
 */
export function createViewRef(view, context) {
    // TODO: add detectChanges back in when implementing ChangeDetectorRef.detectChanges
    return addDestroyable(new ViewRef((view), context));
}
/**
 * Decorates an object with destroy logic (implementing the DestroyRef interface)
 * and returns the enhanced object.
 *
 * @param obj The object to decorate
 * @returns The object with destroy logic
 */
export function addDestroyable(obj) {
    var destroyFn = null;
    obj.destroyed = false;
    obj.destroy = function () {
        destroyFn && destroyFn.forEach(function (fn) { return fn(); });
        this.destroyed = true;
    };
    obj.onDestroy = function (fn) { return (destroyFn || (destroyFn = [])).push(fn); };
    return obj;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL3ZpZXdfcmVmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBVUEsT0FBTyxFQUFDLGNBQWMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJNUUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUV0QyxJQUFBO0lBSUUsaUJBQW9CLEtBQVksRUFBRSxPQUFlO1FBQTdCLFVBQUssR0FBTCxLQUFLLENBQU87UUFBdUIsSUFBSSxDQUFDLE9BQU8sSUFBRyxPQUFTLENBQUEsQ0FBQztLQUFFO0lBRWxGLGdCQUFnQjs7SUFDaEIsc0NBQW9CO0lBQXBCLFVBQXFCLElBQVcsRUFBRSxPQUFVO1FBQzFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0tBQ3hCO0lBRUQseUJBQU8sR0FBUCxjQUFrQixjQUFjLEVBQUUsQ0FBQyxFQUFFO0lBRXJDLDJCQUFTLEdBQVQsVUFBVSxRQUFrQixJQUFJLGNBQWMsRUFBRSxDQUFDLEVBQUU7SUFFbkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BZ0NHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQ0gsOEJBQVk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFaLGNBQXVCLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtJQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BbURHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNILHdCQUFNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQU4sY0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksaUJBQW9CLENBQUMsRUFBRTtJQUU1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Bc0RHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNILDBCQUFROzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQVIsY0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLG9CQUF1QixDQUFDLEVBQUU7SUFFN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FtQkc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNILCtCQUFhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFiLGNBQXdCLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtJQUV0RDs7Ozs7T0FLRzs7Ozs7OztJQUNILGdDQUFjOzs7Ozs7SUFBZCxjQUF5QixjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7a0JBOU0xRDtJQStNQyxDQUFBO0FBL0xELG1CQStMQztBQUdELElBQUE7SUFBd0MsMkNBQVU7SUFNaEQseUJBQVksUUFBbUIsRUFBRSxRQUE4QixFQUFFLE9BQVU7UUFBM0UsWUFDRSxrQkFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUU5QjtRQURDLEtBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDOztLQUM1QjswQkEzTkg7RUFrTndDLE9BQU8sRUFVOUMsQ0FBQTtBQVZELDJCQVVDOzs7Ozs7O0FBUUQsTUFBTSx3QkFBMkIsSUFBa0IsRUFBRSxPQUFVOztJQUU3RCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUEsSUFBTSxDQUFBLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNyRDs7Ozs7Ozs7QUFtQkQsTUFBTSx5QkFBK0IsR0FBUTtJQUMzQyxJQUFJLFNBQVMsR0FBb0IsSUFBSSxDQUFDO0lBQ3RDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3RCLEdBQUcsQ0FBQyxPQUFPLEdBQUc7UUFDWixTQUFTLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQUUsSUFBSyxPQUFBLEVBQUUsRUFBRSxFQUFKLENBQUksQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0tBQ3ZCLENBQUM7SUFDRixHQUFHLENBQUMsU0FBUyxHQUFHLFVBQUMsRUFBWSxJQUFLLE9BQUEsQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQXhDLENBQXdDLENBQUM7SUFDM0UsTUFBTSxDQUFDLEdBQUcsQ0FBQztDQUNaIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VtYmVkZGVkVmlld1JlZiBhcyB2aWV3RW5naW5lX0VtYmVkZGVkVmlld1JlZn0gZnJvbSAnLi4vbGlua2VyL3ZpZXdfcmVmJztcblxuaW1wb3J0IHtjaGVja05vQ2hhbmdlcywgZGV0ZWN0Q2hhbmdlcywgbWFya1ZpZXdEaXJ0eX0gZnJvbSAnLi9pbnN0cnVjdGlvbnMnO1xuaW1wb3J0IHtDb21wb25lbnRUZW1wbGF0ZX0gZnJvbSAnLi9pbnRlcmZhY2VzL2RlZmluaXRpb24nO1xuaW1wb3J0IHtMVmlld05vZGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7TFZpZXcsIExWaWV3RmxhZ3N9IGZyb20gJy4vaW50ZXJmYWNlcy92aWV3JztcbmltcG9ydCB7bm90SW1wbGVtZW50ZWR9IGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBjbGFzcyBWaWV3UmVmPFQ+IGltcGxlbWVudHMgdmlld0VuZ2luZV9FbWJlZGRlZFZpZXdSZWY8VD4ge1xuICBjb250ZXh0OiBUO1xuICByb290Tm9kZXM6IGFueVtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IExWaWV3LCBjb250ZXh0OiBUfG51bGwsICkgeyB0aGlzLmNvbnRleHQgPSBjb250ZXh0ICE7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zZXRDb21wb25lbnRDb250ZXh0KHZpZXc6IExWaWV3LCBjb250ZXh0OiBUKSB7XG4gICAgdGhpcy5fdmlldyA9IHZpZXc7XG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7IG5vdEltcGxlbWVudGVkKCk7IH1cbiAgZGVzdHJveWVkOiBib29sZWFuO1xuICBvbkRlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IG5vdEltcGxlbWVudGVkKCk7IH1cblxuICAvKipcbiAgICogTWFya3MgYSB2aWV3IGFuZCBhbGwgb2YgaXRzIGFuY2VzdG9ycyBkaXJ0eS5cbiAgICpcbiAgICogSXQgYWxzbyB0cmlnZ2VycyBjaGFuZ2UgZGV0ZWN0aW9uIGJ5IGNhbGxpbmcgYHNjaGVkdWxlVGlja2AgaW50ZXJuYWxseSwgd2hpY2ggY29hbGVzY2VzXG4gICAqIG11bHRpcGxlIGBtYXJrRm9yQ2hlY2tgIGNhbGxzIHRvIGludG8gb25lIGNoYW5nZSBkZXRlY3Rpb24gcnVuLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIGVuc3VyZSBhbiB7QGxpbmsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kjT25QdXNoIE9uUHVzaH0gY29tcG9uZW50IGlzXG4gICAqIGNoZWNrZWQgd2hlbiBpdCBuZWVkcyB0byBiZSByZS1yZW5kZXJlZCBidXQgdGhlIHR3byBub3JtYWwgdHJpZ2dlcnMgaGF2ZW4ndCBtYXJrZWQgaXRcbiAgICogZGlydHkgKGkuZS4gaW5wdXRzIGhhdmVuJ3QgY2hhbmdlZCBhbmQgZXZlbnRzIGhhdmVuJ3QgZmlyZWQgaW4gdGhlIHZpZXcpLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIE9uUHVzaCBjb21wb25lbnRzIC0tPlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cHM6Ly9zdGFja2JsaXR6LmNvbS9lZGl0L2FuZ3VsYXIta3g3cnJ3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ215LWFwcCcsXG4gICAqICAgdGVtcGxhdGU6IGBOdW1iZXIgb2YgdGlja3M6IHt7bnVtYmVyT2ZUaWNrc319YFxuICAgKiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICAgKiAgIG51bWJlck9mVGlja3MgPSAwO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgKiAgICAgICB0aGlzLm51bWJlck9mVGlja3MrKztcbiAgICogICAgICAgLy8gdGhlIGZvbGxvd2luZyBpcyByZXF1aXJlZCwgb3RoZXJ3aXNlIHRoZSB2aWV3IHdpbGwgbm90IGJlIHVwZGF0ZWRcbiAgICogICAgICAgdGhpcy5yZWYubWFya0ZvckNoZWNrKCk7XG4gICAqICAgICB9LCAxMDAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBtYXJrRm9yQ2hlY2soKTogdm9pZCB7IG1hcmtWaWV3RGlydHkodGhpcy5fdmlldyk7IH1cblxuICAvKipcbiAgICogRGV0YWNoZXMgdGhlIHZpZXcgZnJvbSB0aGUgY2hhbmdlIGRldGVjdGlvbiB0cmVlLlxuICAgKlxuICAgKiBEZXRhY2hlZCB2aWV3cyB3aWxsIG5vdCBiZSBjaGVja2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgdW50aWwgdGhleSBhcmVcbiAgICogcmUtYXR0YWNoZWQsIGV2ZW4gaWYgdGhleSBhcmUgZGlydHkuIGBkZXRhY2hgIGNhbiBiZSB1c2VkIGluIGNvbWJpbmF0aW9uIHdpdGhcbiAgICoge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXMgZGV0ZWN0Q2hhbmdlc30gdG8gaW1wbGVtZW50IGxvY2FsIGNoYW5nZVxuICAgKiBkZXRlY3Rpb24gY2hlY2tzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIGRldGFjaC9yZWF0dGFjaC9sb2NhbCBkaWdlc3QgLS0+XG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGl2ZSBkZW1vIG9uY2UgcmVmLmRldGVjdENoYW5nZXMgaXMgbWVyZ2VkIGludG8gbWFzdGVyIC0tPlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIGNvbXBvbmVudCB3aXRoIGEgbGFyZ2UgbGlzdCBvZiByZWFkb25seSBkYXRhLlxuICAgKiBJbWFnaW5lIHRoZSBkYXRhIGNoYW5nZXMgY29uc3RhbnRseSwgbWFueSB0aW1lcyBwZXIgc2Vjb25kLiBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucyxcbiAgICogd2Ugd2FudCB0byBjaGVjayBhbmQgdXBkYXRlIHRoZSBsaXN0IGV2ZXJ5IGZpdmUgc2Vjb25kcy4gV2UgY2FuIGRvIHRoYXQgYnkgZGV0YWNoaW5nXG4gICAqIHRoZSBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgYW5kIGRvaW5nIGEgbG9jYWwgY2hlY2sgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIERhdGFQcm92aWRlciB7XG4gICAqICAgLy8gaW4gYSByZWFsIGFwcGxpY2F0aW9uIHRoZSByZXR1cm5lZCBkYXRhIHdpbGwgYmUgZGlmZmVyZW50IGV2ZXJ5IHRpbWVcbiAgICogICBnZXQgZGF0YSgpIHtcbiAgICogICAgIHJldHVybiBbMSwyLDMsNCw1XTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdnaWFudC1saXN0JyxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGxpICpuZ0Zvcj1cImxldCBkIG9mIGRhdGFQcm92aWRlci5kYXRhXCI+RGF0YSB7e2R9fTwvbGk+XG4gICAqICAgYCxcbiAgICogfSlcbiAgICogY2xhc3MgR2lhbnRMaXN0IHtcbiAgICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsIHByaXZhdGUgZGF0YVByb3ZpZGVyOiBEYXRhUHJvdmlkZXIpIHtcbiAgICogICAgIHJlZi5kZXRhY2goKTtcbiAgICogICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICogICAgICAgdGhpcy5yZWYuZGV0ZWN0Q2hhbmdlcygpO1xuICAgKiAgICAgfSwgNTAwMCk7XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICBwcm92aWRlcnM6IFtEYXRhUHJvdmlkZXJdLFxuICAgKiAgIHRlbXBsYXRlOiBgXG4gICAqICAgICA8Z2lhbnQtbGlzdD48Z2lhbnQtbGlzdD5cbiAgICogICBgLFxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge1xuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgZGV0YWNoKCk6IHZvaWQgeyB0aGlzLl92aWV3LmZsYWdzICY9IH5MVmlld0ZsYWdzLkF0dGFjaGVkOyB9XG5cbiAgLyoqXG4gICAqIFJlLWF0dGFjaGVzIGEgdmlldyB0byB0aGUgY2hhbmdlIGRldGVjdGlvbiB0cmVlLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIHJlLWF0dGFjaCB2aWV3cyB0aGF0IHdlcmUgcHJldmlvdXNseSBkZXRhY2hlZCBmcm9tIHRoZSB0cmVlXG4gICAqIHVzaW5nIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRhY2ggZGV0YWNofS4gVmlld3MgYXJlIGF0dGFjaGVkIHRvIHRoZSB0cmVlIGJ5IGRlZmF1bHQuXG4gICAqXG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGluayB0byBhIGNoYXB0ZXIgb24gZGV0YWNoL3JlYXR0YWNoL2xvY2FsIGRpZ2VzdCAtLT5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHBzOi8vc3RhY2tibGl0ei5jb20vZWRpdC9hbmd1bGFyLXltZ3N4dykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IGRpc3BsYXlpbmcgYGxpdmVgIGRhdGEuIFRoZSBjb21wb25lbnQgd2lsbCBkZXRhY2hcbiAgICogaXRzIGNoYW5nZSBkZXRlY3RvciBmcm9tIHRoZSBtYWluIGNoYW5nZSBkZXRlY3RvciB0cmVlIHdoZW4gdGhlIGNvbXBvbmVudCdzIGxpdmUgcHJvcGVydHlcbiAgICogaXMgc2V0IHRvIGZhbHNlLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIGNsYXNzIERhdGFQcm92aWRlciB7XG4gICAqICAgZGF0YSA9IDE7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAqICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YSAqIDI7XG4gICAqICAgICB9LCA1MDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2xpdmUtZGF0YScsXG4gICAqICAgaW5wdXRzOiBbJ2xpdmUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ0RhdGE6IHt7ZGF0YVByb3ZpZGVyLmRhdGF9fSdcbiAgICogfSlcbiAgICogY2xhc3MgTGl2ZURhdGEge1xuICAgKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVmOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHJpdmF0ZSBkYXRhUHJvdmlkZXI6IERhdGFQcm92aWRlcikge31cbiAgICpcbiAgICogICBzZXQgbGl2ZSh2YWx1ZSkge1xuICAgKiAgICAgaWYgKHZhbHVlKSB7XG4gICAqICAgICAgIHRoaXMucmVmLnJlYXR0YWNoKCk7XG4gICAqICAgICB9IGVsc2Uge1xuICAgKiAgICAgICB0aGlzLnJlZi5kZXRhY2goKTtcbiAgICogICAgIH1cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICAgKiAgIHByb3ZpZGVyczogW0RhdGFQcm92aWRlcl0sXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIExpdmUgVXBkYXRlOiA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgWyhuZ01vZGVsKV09XCJsaXZlXCI+XG4gICAqICAgICA8bGl2ZS1kYXRhIFtsaXZlXT1cImxpdmVcIj48bGl2ZS1kYXRhPlxuICAgKiAgIGAsXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcENvbXBvbmVudCB7XG4gICAqICAgbGl2ZSA9IHRydWU7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICByZWF0dGFjaCgpOiB2b2lkIHsgdGhpcy5fdmlldy5mbGFncyB8PSBMVmlld0ZsYWdzLkF0dGFjaGVkOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgdmlldyBhbmQgaXRzIGNoaWxkcmVuLlxuICAgKlxuICAgKiBUaGlzIGNhbiBhbHNvIGJlIHVzZWQgaW4gY29tYmluYXRpb24gd2l0aCB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0YWNoIGRldGFjaH0gdG8gaW1wbGVtZW50XG4gICAqIGxvY2FsIGNoYW5nZSBkZXRlY3Rpb24gY2hlY2tzLlxuICAgKlxuICAgKiA8IS0tIFRPRE86IEFkZCBhIGxpbmsgdG8gYSBjaGFwdGVyIG9uIGRldGFjaC9yZWF0dGFjaC9sb2NhbCBkaWdlc3QgLS0+XG4gICAqIDwhLS0gVE9ETzogQWRkIGEgbGl2ZSBkZW1vIG9uY2UgcmVmLmRldGVjdENoYW5nZXMgaXMgbWVyZ2VkIGludG8gbWFzdGVyIC0tPlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVmaW5lcyBhIGNvbXBvbmVudCB3aXRoIGEgbGFyZ2UgbGlzdCBvZiByZWFkb25seSBkYXRhLlxuICAgKiBJbWFnaW5lLCB0aGUgZGF0YSBjaGFuZ2VzIGNvbnN0YW50bHksIG1hbnkgdGltZXMgcGVyIHNlY29uZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsXG4gICAqIHdlIHdhbnQgdG8gY2hlY2sgYW5kIHVwZGF0ZSB0aGUgbGlzdCBldmVyeSBmaXZlIHNlY29uZHMuXG4gICAqXG4gICAqIFdlIGNhbiBkbyB0aGF0IGJ5IGRldGFjaGluZyB0aGUgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIGFuZCBkb2luZyBhIGxvY2FsIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogY2hlY2sgZXZlcnkgZml2ZSBzZWNvbmRzLlxuICAgKlxuICAgKiBTZWUge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGFjaCBkZXRhY2h9IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHsgZGV0ZWN0Q2hhbmdlcyh0aGlzLmNvbnRleHQpOyB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgY2hhbmdlIGRldGVjdG9yIGFuZCBpdHMgY2hpbGRyZW4sIGFuZCB0aHJvd3MgaWYgYW55IGNoYW5nZXMgYXJlIGRldGVjdGVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW4gZGV2ZWxvcG1lbnQgbW9kZSB0byB2ZXJpZnkgdGhhdCBydW5uaW5nIGNoYW5nZSBkZXRlY3Rpb24gZG9lc24ndFxuICAgKiBpbnRyb2R1Y2Ugb3RoZXIgY2hhbmdlcy5cbiAgICovXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyBjaGVja05vQ2hhbmdlcyh0aGlzLmNvbnRleHQpOyB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEVtYmVkZGVkVmlld1JlZjxUPiBleHRlbmRzIFZpZXdSZWY8VD4ge1xuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfbFZpZXdOb2RlOiBMVmlld05vZGU7XG5cbiAgY29uc3RydWN0b3Iodmlld05vZGU6IExWaWV3Tm9kZSwgdGVtcGxhdGU6IENvbXBvbmVudFRlbXBsYXRlPFQ+LCBjb250ZXh0OiBUKSB7XG4gICAgc3VwZXIodmlld05vZGUuZGF0YSwgY29udGV4dCk7XG4gICAgdGhpcy5fbFZpZXdOb2RlID0gdmlld05vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgVmlld1JlZiBidW5kbGVkIHdpdGggZGVzdHJveSBmdW5jdGlvbmFsaXR5LlxuICpcbiAqIEBwYXJhbSBjb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGlzIHZpZXdcbiAqIEByZXR1cm5zIFRoZSBWaWV3UmVmXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWaWV3UmVmPFQ+KHZpZXc6IExWaWV3IHwgbnVsbCwgY29udGV4dDogVCk6IFZpZXdSZWY8VD4ge1xuICAvLyBUT0RPOiBhZGQgZGV0ZWN0Q2hhbmdlcyBiYWNrIGluIHdoZW4gaW1wbGVtZW50aW5nIENoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXNcbiAgcmV0dXJuIGFkZERlc3Ryb3lhYmxlKG5ldyBWaWV3UmVmKHZpZXcgISwgY29udGV4dCkpO1xufVxuXG4vKiogSW50ZXJmYWNlIGZvciBkZXN0cm95IGxvZ2ljLiBJbXBsZW1lbnRlZCBieSBhZGREZXN0cm95YWJsZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVzdHJveVJlZjxUPiB7XG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGlzIG9iamVjdCBoYXMgYmVlbiBkZXN0cm95ZWQgKi9cbiAgZGVzdHJveWVkOiBib29sZWFuO1xuICAvKiogRGVzdHJveSB0aGUgaW5zdGFuY2UgYW5kIGNhbGwgYWxsIG9uRGVzdHJveSBjYWxsYmFja3MuICovXG4gIGRlc3Ryb3koKTogdm9pZDtcbiAgLyoqIFJlZ2lzdGVyIGNhbGxiYWNrcyB0aGF0IHNob3VsZCBiZSBjYWxsZWQgb25EZXN0cm95ICovXG4gIG9uRGVzdHJveShjYjogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG4vKipcbiAqIERlY29yYXRlcyBhbiBvYmplY3Qgd2l0aCBkZXN0cm95IGxvZ2ljIChpbXBsZW1lbnRpbmcgdGhlIERlc3Ryb3lSZWYgaW50ZXJmYWNlKVxuICogYW5kIHJldHVybnMgdGhlIGVuaGFuY2VkIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgdG8gZGVjb3JhdGVcbiAqIEByZXR1cm5zIFRoZSBvYmplY3Qgd2l0aCBkZXN0cm95IGxvZ2ljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZXN0cm95YWJsZTxULCBDPihvYmo6IGFueSk6IFQmRGVzdHJveVJlZjxDPiB7XG4gIGxldCBkZXN0cm95Rm46IEZ1bmN0aW9uW118bnVsbCA9IG51bGw7XG4gIG9iai5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgb2JqLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBkZXN0cm95Rm4gJiYgZGVzdHJveUZuLmZvckVhY2goKGZuKSA9PiBmbigpKTtcbiAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gIH07XG4gIG9iai5vbkRlc3Ryb3kgPSAoZm46IEZ1bmN0aW9uKSA9PiAoZGVzdHJveUZuIHx8IChkZXN0cm95Rm4gPSBbXSkpLnB1c2goZm4pO1xuICByZXR1cm4gb2JqO1xufVxuIl19