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
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `currentView` to that
 * `LView`. When that view is done processing, the `currentView` is set back to
 * whatever the original `currentView` was before (the parent `LView`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 * @record
 */
export function LView() { }
function LView_tsickle_Closure_declarations() {
    /**
     * Flags for this view (see LViewFlags for definition of each bit).
     * @type {?}
     */
    LView.prototype.flags;
    /**
     * The parent view is needed when we exit the view and must restore the previous
     * `LView`. Without this, the render method would have to keep a stack of
     * views as it is recursively rendering templates.
     * @type {?}
     */
    LView.prototype.parent;
    /**
     * Pointer to the `LViewNode` or `LElementNode` which represents the root of the view.
     *
     * If `LViewNode`, this is an embedded view of a container. We need this to be able to
     * efficiently find the `LViewNode` when inserting the view into an anchor.
     *
     * If `LElementNode`, this is the LView of a component.
     * @type {?}
     */
    LView.prototype.node;
    /**
     * ID to determine whether this view is the same as the previous view
     * in this position. If it's not, we know this view needs to be inserted
     * and the one that exists needs to be removed (e.g. if/else statements)
     * @type {?}
     */
    LView.prototype.id;
    /**
     * Renderer to be used for this view.
     * @type {?}
     */
    LView.prototype.renderer;
    /**
     * The binding start index is the index at which the nodes array
     * starts to store bindings only. Saving this value ensures that we
     * will begin reading bindings at the correct point in the array when
     * we are in update mode.
     * @type {?}
     */
    LView.prototype.bindingStartIndex;
    /**
     * The binding index we should access next.
     *
     * This is stored so that bindings can continue where they left off
     * if a view is left midway through processing bindings (e.g. if there is
     * a setter that creates an embedded view, like in ngIf).
     * @type {?}
     */
    LView.prototype.bindingIndex;
    /**
     * When a view is destroyed, listeners need to be released and outputs need to be
     * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
     * and output data (in chunks of 2) for a particular view. Combining the arrays
     * saves on memory (70 bytes per array) and on a few bytes of code size (for two
     * separate for loops).
     *
     * If it's a listener being stored:
     * 1st index is: event name to remove
     * 2nd index is: native element
     * 3rd index is: listener function
     * 4th index is: useCapture boolean
     *
     * If it's an output subscription:
     * 1st index is: unsubscribe function
     * 2nd index is: context for function
     * @type {?}
     */
    LView.prototype.cleanup;
    /**
     * This number tracks the next lifecycle hook that needs to be run.
     *
     * If lifecycleStage === LifecycleStage.ON_INIT, the init hooks haven't yet been run
     * and should be executed by the first r() instruction that runs OR the first
     * cR() instruction that runs (so inits are run for the top level view before any
     * embedded views).
     *
     * If lifecycleStage === LifecycleStage.CONTENT_INIT, the init hooks have been run, but
     * the content hooks have not yet been run. They should be executed on the first
     * r() instruction that runs.
     *
     * If lifecycleStage === LifecycleStage.VIEW_INIT, both the init hooks and content hooks
     * have already been run.
     * @type {?}
     */
    LView.prototype.lifecycleStage;
    /**
     * The first LView or LContainer beneath this LView in the hierarchy.
     *
     * Necessary to store this so views can traverse through their nested views
     * to remove listeners and call onDestroy callbacks.
     *
     * For embedded views, we store the LContainer rather than the first ViewState
     * to avoid managing splicing when views are added/removed.
     * @type {?}
     */
    LView.prototype.child;
    /**
     * The last LView or LContainer beneath this LView in the hierarchy.
     *
     * The tail allows us to quickly add a new state to the end of the view list
     * without having to propagate starting from the first child.
     * @type {?}
     */
    LView.prototype.tail;
    /**
     * The next sibling LView or LContainer.
     *
     * Allows us to propagate between sibling view states that aren't in the same
     * container. Embedded views already have a node.next, but it is only set for
     * views in the same container. We need a way to link component views and views
     * across containers as well.
     * @type {?}
     */
    LView.prototype.next;
    /**
     * This array stores all element/text/container nodes created inside this view
     * and their bindings. Stored as an array rather than a linked list so we can
     * look up nodes directly in the case of forward declaration or bindings
     * (e.g. E(1)).
     *
     * All bindings for a given view are stored in the order in which they
     * appear in the template, starting with `bindingStartIndex`.
     * We use `bindingIndex` to internally keep track of which binding
     * is currently active.
     * @type {?}
     */
    LView.prototype.data;
    /**
     * An array of directive instances in the current view.
     *
     * These must be stored separately from LNodes because their presence is
     * unknown at compile-time and thus space cannot be reserved in data[].
     * @type {?}
     */
    LView.prototype.directives;
    /**
     * The static data for this view. We need a reference to this so we can easily walk up the
     * node tree in DI and get the TView.data array associated with a node (where the
     * directive defs are stored).
     * @type {?}
     */
    LView.prototype.tView;
    /**
     * For dynamically inserted views, the template function to refresh the view.
     * @type {?}
     */
    LView.prototype.template;
    /**
     * - For embedded views, the context with which to render the template.
     * - For root view of the root component the context contains change detection data.
     * - `null` otherwise.
     * @type {?}
     */
    LView.prototype.context;
    /**
     * A count of dynamic views that are children of this view (indirectly via containers).
     *
     * This is used to decide whether to scan children of this view when refreshing dynamic views
     * after refreshing the view itself.
     * @type {?}
     */
    LView.prototype.dynamicViewCount;
    /**
     * Queries active for this view - nodes from a view are reported to those queries
     * @type {?}
     */
    LView.prototype.queries;
    /**
     * An optional Module Injector to be used as fall back after Element Injectors are consulted.
     * @type {?}
     */
    LView.prototype.injector;
}
/** @enum {number} */
const LViewFlags = {
    /**
       * Whether or not the view is in creationMode.
       *
       * This must be stored in the view rather than using `data` as a marker so that
       * we can properly support embedded views. Otherwise, when exiting a child view
       * back into the parent view, `data` will be defined and `creationMode` will be
       * improperly reported as false.
       */
    CreationMode: 1,
    /** Whether this view has default change detection strategy (checks always) or onPush */
    CheckAlways: 2,
    /** Whether or not this view is currently dirty (needing check) */
    Dirty: 4,
    /** Whether or not this view is currently attached to change detection tree. */
    Attached: 8,
};
export { LViewFlags };
/**
 * Interface necessary to work with view tree traversal
 * @record
 */
export function LViewOrLContainer() { }
function LViewOrLContainer_tsickle_Closure_declarations() {
    /** @type {?} */
    LViewOrLContainer.prototype.next;
    /** @type {?|undefined} */
    LViewOrLContainer.prototype.child;
    /** @type {?|undefined} */
    LViewOrLContainer.prototype.views;
    /** @type {?} */
    LViewOrLContainer.prototype.parent;
}
/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the template function as ngPrivateData.
 * @record
 */
export function TView() { }
function TView_tsickle_Closure_declarations() {
    /**
     * Whether or not this template has been processed.
     * @type {?}
     */
    TView.prototype.firstTemplatePass;
    /**
     * Static data equivalent of LView.data[]. Contains TNodes.
     * @type {?}
     */
    TView.prototype.data;
    /**
     * Selector matches for a node are temporarily cached on the TView so the
     * DI system can eagerly instantiate directives on the same node if they are
     * created out of order. They are overwritten after each node.
     *
     * <div dirA dirB></div>
     *
     * e.g. DirA injects DirB, but DirA is created first. DI should instantiate
     * DirB when it finds that it's on the same node, but not yet created.
     *
     * Even indices: Directive defs
     * Odd indices:
     *   - Null if the associated directive hasn't been instantiated yet
     *   - Directive index, if associated directive has been created
     *   - String, temporary 'CIRCULAR' token set while dependencies are being resolved
     * @type {?}
     */
    TView.prototype.currentMatches;
    /**
     * Directive and component defs that have already been matched to nodes on
     * this view.
     *
     * Defs are stored at the same index in TView.directives[] as their instances
     * are stored in LView.directives[]. This simplifies lookup in DI.
     * @type {?}
     */
    TView.prototype.directives;
    /**
     * Full registry of directives and components that may be found in this view.
     *
     * It's necessary to keep a copy of the full def list on the TView so it's possible
     * to render template functions without a host component.
     * @type {?}
     */
    TView.prototype.directiveRegistry;
    /**
     * Full registry of pipes that may be found in this view.
     *
     * The property is either an array of `PipeDefs`s or a function which returns the array of
     * `PipeDefs`s. The function is necessary to be able to support forward declarations.
     *
     * It's necessary to keep a copy of the full def list on the TView so it's possible
     * to render template functions without a host component.
     * @type {?}
     */
    TView.prototype.pipeRegistry;
    /**
     * Array of ngOnInit and ngDoCheck hooks that should be executed for this view in
     * creation mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.initHooks;
    /**
     * Array of ngDoCheck hooks that should be executed for this view in update mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.checkHooks;
    /**
     * Array of ngAfterContentInit and ngAfterContentChecked hooks that should be executed
     * for this view in creation mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.contentHooks;
    /**
     * Array of ngAfterContentChecked hooks that should be executed for this view in update
     * mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.contentCheckHooks;
    /**
     * Array of ngAfterViewInit and ngAfterViewChecked hooks that should be executed for
     * this view in creation mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.viewHooks;
    /**
     * Array of ngAfterViewChecked hooks that should be executed for this view in
     * update mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.viewCheckHooks;
    /**
     * Array of ngOnDestroy hooks that should be executed when this view is destroyed.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     * @type {?}
     */
    TView.prototype.destroyHooks;
    /**
     * Array of pipe ngOnDestroy hooks that should be executed when this view is destroyed.
     *
     * Even indices: Index of pipe in data
     * Odd indices: Hook function
     *
     * These must be stored separately from directive destroy hooks because their contexts
     * are stored in data.
     * @type {?}
     */
    TView.prototype.pipeDestroyHooks;
    /**
     * A list of directive and element indices for child components that will need to be
     * refreshed when the current view has finished its check.
     *
     * Even indices: Directive indices
     * Odd indices: Element indices
     * @type {?}
     */
    TView.prototype.components;
    /**
     * A list of indices for child directives that have host bindings.
     *
     * Even indices: Directive indices
     * Odd indices: Element indices
     * @type {?}
     */
    TView.prototype.hostBindings;
}
/**
 * RootContext contains information which is shared for all components which
 * were bootstrapped with {\@link renderComponent}.
 * @record
 */
export function RootContext() { }
function RootContext_tsickle_Closure_declarations() {
    /**
     * A function used for scheduling change detection in the future. Usually
     * this is `requestAnimationFrame`.
     * @type {?}
     */
    RootContext.prototype.scheduler;
    /**
     * A promise which is resolved when all components are considered clean (not dirty).
     *
     * This promise is overwritten every time a first call to {\@link markDirty} is invoked.
     * @type {?}
     */
    RootContext.prototype.clean;
    /**
     * RootComponent - The component which was instantiated by the call to
     * {\@link renderComponent}.
     * @type {?}
     */
    RootContext.prototype.component;
}
/** @enum {number} */
const LifecycleStage = {
    /* Init hooks need to be run, if any. */
    Init: 1,
    /* Content hooks need to be run, if any. Init hooks have already run. */
    AfterInit: 2,
};
export { LifecycleStage };
// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const /** @type {?} */ unusedValueExportToPlacateAjd = 1;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvaW50ZXJmYWNlcy92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcWJBLE1BQU0sQ0FBQyx1QkFBTSw2QkFBNkIsR0FBRyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJy4uLy4uL2RpL2luamVjdG9yJztcbmltcG9ydCB7TENvbnRhaW5lcn0gZnJvbSAnLi9jb250YWluZXInO1xuaW1wb3J0IHtDb21wb25lbnRUZW1wbGF0ZSwgRGlyZWN0aXZlRGVmLCBEaXJlY3RpdmVEZWZMaXN0LCBQaXBlRGVmLCBQaXBlRGVmTGlzdH0gZnJvbSAnLi9kZWZpbml0aW9uJztcbmltcG9ydCB7TEVsZW1lbnROb2RlLCBMVmlld05vZGUsIFROb2RlfSBmcm9tICcuL25vZGUnO1xuaW1wb3J0IHtMUXVlcmllc30gZnJvbSAnLi9xdWVyeSc7XG5pbXBvcnQge1JlbmRlcmVyM30gZnJvbSAnLi9yZW5kZXJlcic7XG5cblxuXG4vKipcbiAqIGBMVmlld2Agc3RvcmVzIGFsbCBvZiB0aGUgaW5mb3JtYXRpb24gbmVlZGVkIHRvIHByb2Nlc3MgdGhlIGluc3RydWN0aW9ucyBhc1xuICogdGhleSBhcmUgaW52b2tlZCBmcm9tIHRoZSB0ZW1wbGF0ZS4gRWFjaCBlbWJlZGRlZCB2aWV3IGFuZCBjb21wb25lbnQgdmlldyBoYXMgaXRzXG4gKiBvd24gYExWaWV3YC4gV2hlbiBwcm9jZXNzaW5nIGEgcGFydGljdWxhciB2aWV3LCB3ZSBzZXQgdGhlIGBjdXJyZW50Vmlld2AgdG8gdGhhdFxuICogYExWaWV3YC4gV2hlbiB0aGF0IHZpZXcgaXMgZG9uZSBwcm9jZXNzaW5nLCB0aGUgYGN1cnJlbnRWaWV3YCBpcyBzZXQgYmFjayB0b1xuICogd2hhdGV2ZXIgdGhlIG9yaWdpbmFsIGBjdXJyZW50Vmlld2Agd2FzIGJlZm9yZSAodGhlIHBhcmVudCBgTFZpZXdgKS5cbiAqXG4gKiBLZWVwaW5nIHNlcGFyYXRlIHN0YXRlIGZvciBlYWNoIHZpZXcgZmFjaWxpdGllcyB2aWV3IGluc2VydGlvbiAvIGRlbGV0aW9uLCBzbyB3ZVxuICogZG9uJ3QgaGF2ZSB0byBlZGl0IHRoZSBkYXRhIGFycmF5IGJhc2VkIG9uIHdoaWNoIHZpZXdzIGFyZSBwcmVzZW50LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExWaWV3IHtcbiAgLyoqIEZsYWdzIGZvciB0aGlzIHZpZXcgKHNlZSBMVmlld0ZsYWdzIGZvciBkZWZpbml0aW9uIG9mIGVhY2ggYml0KS4gKi9cbiAgZmxhZ3M6IExWaWV3RmxhZ3M7XG5cbiAgLyoqXG4gICAqIFRoZSBwYXJlbnQgdmlldyBpcyBuZWVkZWQgd2hlbiB3ZSBleGl0IHRoZSB2aWV3IGFuZCBtdXN0IHJlc3RvcmUgdGhlIHByZXZpb3VzXG4gICAqIGBMVmlld2AuIFdpdGhvdXQgdGhpcywgdGhlIHJlbmRlciBtZXRob2Qgd291bGQgaGF2ZSB0byBrZWVwIGEgc3RhY2sgb2ZcbiAgICogdmlld3MgYXMgaXQgaXMgcmVjdXJzaXZlbHkgcmVuZGVyaW5nIHRlbXBsYXRlcy5cbiAgICovXG4gIHJlYWRvbmx5IHBhcmVudDogTFZpZXd8bnVsbDtcblxuICAvKipcbiAgICogUG9pbnRlciB0byB0aGUgYExWaWV3Tm9kZWAgb3IgYExFbGVtZW50Tm9kZWAgd2hpY2ggcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgdmlldy5cbiAgICpcbiAgICogSWYgYExWaWV3Tm9kZWAsIHRoaXMgaXMgYW4gZW1iZWRkZWQgdmlldyBvZiBhIGNvbnRhaW5lci4gV2UgbmVlZCB0aGlzIHRvIGJlIGFibGUgdG9cbiAgICogZWZmaWNpZW50bHkgZmluZCB0aGUgYExWaWV3Tm9kZWAgd2hlbiBpbnNlcnRpbmcgdGhlIHZpZXcgaW50byBhbiBhbmNob3IuXG4gICAqXG4gICAqIElmIGBMRWxlbWVudE5vZGVgLCB0aGlzIGlzIHRoZSBMVmlldyBvZiBhIGNvbXBvbmVudC5cbiAgICovXG4gIHJlYWRvbmx5IG5vZGU6IExWaWV3Tm9kZXxMRWxlbWVudE5vZGU7XG5cbiAgLyoqXG4gICAqIElEIHRvIGRldGVybWluZSB3aGV0aGVyIHRoaXMgdmlldyBpcyB0aGUgc2FtZSBhcyB0aGUgcHJldmlvdXMgdmlld1xuICAgKiBpbiB0aGlzIHBvc2l0aW9uLiBJZiBpdCdzIG5vdCwgd2Uga25vdyB0aGlzIHZpZXcgbmVlZHMgdG8gYmUgaW5zZXJ0ZWRcbiAgICogYW5kIHRoZSBvbmUgdGhhdCBleGlzdHMgbmVlZHMgdG8gYmUgcmVtb3ZlZCAoZS5nLiBpZi9lbHNlIHN0YXRlbWVudHMpXG4gICAqL1xuICByZWFkb25seSBpZDogbnVtYmVyO1xuXG4gIC8qKiBSZW5kZXJlciB0byBiZSB1c2VkIGZvciB0aGlzIHZpZXcuICovXG4gIHJlYWRvbmx5IHJlbmRlcmVyOiBSZW5kZXJlcjM7XG5cbiAgLyoqXG4gICAqIFRoZSBiaW5kaW5nIHN0YXJ0IGluZGV4IGlzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgbm9kZXMgYXJyYXlcbiAgICogc3RhcnRzIHRvIHN0b3JlIGJpbmRpbmdzIG9ubHkuIFNhdmluZyB0aGlzIHZhbHVlIGVuc3VyZXMgdGhhdCB3ZVxuICAgKiB3aWxsIGJlZ2luIHJlYWRpbmcgYmluZGluZ3MgYXQgdGhlIGNvcnJlY3QgcG9pbnQgaW4gdGhlIGFycmF5IHdoZW5cbiAgICogd2UgYXJlIGluIHVwZGF0ZSBtb2RlLlxuICAgKi9cbiAgYmluZGluZ1N0YXJ0SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGJpbmRpbmcgaW5kZXggd2Ugc2hvdWxkIGFjY2VzcyBuZXh0LlxuICAgKlxuICAgKiBUaGlzIGlzIHN0b3JlZCBzbyB0aGF0IGJpbmRpbmdzIGNhbiBjb250aW51ZSB3aGVyZSB0aGV5IGxlZnQgb2ZmXG4gICAqIGlmIGEgdmlldyBpcyBsZWZ0IG1pZHdheSB0aHJvdWdoIHByb2Nlc3NpbmcgYmluZGluZ3MgKGUuZy4gaWYgdGhlcmUgaXNcbiAgICogYSBzZXR0ZXIgdGhhdCBjcmVhdGVzIGFuIGVtYmVkZGVkIHZpZXcsIGxpa2UgaW4gbmdJZikuXG4gICAqL1xuICBiaW5kaW5nSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogV2hlbiBhIHZpZXcgaXMgZGVzdHJveWVkLCBsaXN0ZW5lcnMgbmVlZCB0byBiZSByZWxlYXNlZCBhbmQgb3V0cHV0cyBuZWVkIHRvIGJlXG4gICAqIHVuc3Vic2NyaWJlZC4gVGhpcyBjbGVhbnVwIGFycmF5IHN0b3JlcyBib3RoIGxpc3RlbmVyIGRhdGEgKGluIGNodW5rcyBvZiA0KVxuICAgKiBhbmQgb3V0cHV0IGRhdGEgKGluIGNodW5rcyBvZiAyKSBmb3IgYSBwYXJ0aWN1bGFyIHZpZXcuIENvbWJpbmluZyB0aGUgYXJyYXlzXG4gICAqIHNhdmVzIG9uIG1lbW9yeSAoNzAgYnl0ZXMgcGVyIGFycmF5KSBhbmQgb24gYSBmZXcgYnl0ZXMgb2YgY29kZSBzaXplIChmb3IgdHdvXG4gICAqIHNlcGFyYXRlIGZvciBsb29wcykuXG4gICAqXG4gICAqIElmIGl0J3MgYSBsaXN0ZW5lciBiZWluZyBzdG9yZWQ6XG4gICAqIDFzdCBpbmRleCBpczogZXZlbnQgbmFtZSB0byByZW1vdmVcbiAgICogMm5kIGluZGV4IGlzOiBuYXRpdmUgZWxlbWVudFxuICAgKiAzcmQgaW5kZXggaXM6IGxpc3RlbmVyIGZ1bmN0aW9uXG4gICAqIDR0aCBpbmRleCBpczogdXNlQ2FwdHVyZSBib29sZWFuXG4gICAqXG4gICAqIElmIGl0J3MgYW4gb3V0cHV0IHN1YnNjcmlwdGlvbjpcbiAgICogMXN0IGluZGV4IGlzOiB1bnN1YnNjcmliZSBmdW5jdGlvblxuICAgKiAybmQgaW5kZXggaXM6IGNvbnRleHQgZm9yIGZ1bmN0aW9uXG4gICAqL1xuICBjbGVhbnVwOiBhbnlbXXxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGlzIG51bWJlciB0cmFja3MgdGhlIG5leHQgbGlmZWN5Y2xlIGhvb2sgdGhhdCBuZWVkcyB0byBiZSBydW4uXG4gICAqXG4gICAqIElmIGxpZmVjeWNsZVN0YWdlID09PSBMaWZlY3ljbGVTdGFnZS5PTl9JTklULCB0aGUgaW5pdCBob29rcyBoYXZlbid0IHlldCBiZWVuIHJ1blxuICAgKiBhbmQgc2hvdWxkIGJlIGV4ZWN1dGVkIGJ5IHRoZSBmaXJzdCByKCkgaW5zdHJ1Y3Rpb24gdGhhdCBydW5zIE9SIHRoZSBmaXJzdFxuICAgKiBjUigpIGluc3RydWN0aW9uIHRoYXQgcnVucyAoc28gaW5pdHMgYXJlIHJ1biBmb3IgdGhlIHRvcCBsZXZlbCB2aWV3IGJlZm9yZSBhbnlcbiAgICogZW1iZWRkZWQgdmlld3MpLlxuICAgKlxuICAgKiBJZiBsaWZlY3ljbGVTdGFnZSA9PT0gTGlmZWN5Y2xlU3RhZ2UuQ09OVEVOVF9JTklULCB0aGUgaW5pdCBob29rcyBoYXZlIGJlZW4gcnVuLCBidXRcbiAgICogdGhlIGNvbnRlbnQgaG9va3MgaGF2ZSBub3QgeWV0IGJlZW4gcnVuLiBUaGV5IHNob3VsZCBiZSBleGVjdXRlZCBvbiB0aGUgZmlyc3RcbiAgICogcigpIGluc3RydWN0aW9uIHRoYXQgcnVucy5cbiAgICpcbiAgICogSWYgbGlmZWN5Y2xlU3RhZ2UgPT09IExpZmVjeWNsZVN0YWdlLlZJRVdfSU5JVCwgYm90aCB0aGUgaW5pdCBob29rcyBhbmQgY29udGVudCBob29rc1xuICAgKiBoYXZlIGFscmVhZHkgYmVlbiBydW4uXG4gICAqL1xuICBsaWZlY3ljbGVTdGFnZTogTGlmZWN5Y2xlU3RhZ2U7XG5cbiAgLyoqXG4gICAqIFRoZSBmaXJzdCBMVmlldyBvciBMQ29udGFpbmVyIGJlbmVhdGggdGhpcyBMVmlldyBpbiB0aGUgaGllcmFyY2h5LlxuICAgKlxuICAgKiBOZWNlc3NhcnkgdG8gc3RvcmUgdGhpcyBzbyB2aWV3cyBjYW4gdHJhdmVyc2UgdGhyb3VnaCB0aGVpciBuZXN0ZWQgdmlld3NcbiAgICogdG8gcmVtb3ZlIGxpc3RlbmVycyBhbmQgY2FsbCBvbkRlc3Ryb3kgY2FsbGJhY2tzLlxuICAgKlxuICAgKiBGb3IgZW1iZWRkZWQgdmlld3MsIHdlIHN0b3JlIHRoZSBMQ29udGFpbmVyIHJhdGhlciB0aGFuIHRoZSBmaXJzdCBWaWV3U3RhdGVcbiAgICogdG8gYXZvaWQgbWFuYWdpbmcgc3BsaWNpbmcgd2hlbiB2aWV3cyBhcmUgYWRkZWQvcmVtb3ZlZC5cbiAgICovXG4gIGNoaWxkOiBMVmlld3xMQ29udGFpbmVyfG51bGw7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IExWaWV3IG9yIExDb250YWluZXIgYmVuZWF0aCB0aGlzIExWaWV3IGluIHRoZSBoaWVyYXJjaHkuXG4gICAqXG4gICAqIFRoZSB0YWlsIGFsbG93cyB1cyB0byBxdWlja2x5IGFkZCBhIG5ldyBzdGF0ZSB0byB0aGUgZW5kIG9mIHRoZSB2aWV3IGxpc3RcbiAgICogd2l0aG91dCBoYXZpbmcgdG8gcHJvcGFnYXRlIHN0YXJ0aW5nIGZyb20gdGhlIGZpcnN0IGNoaWxkLlxuICAgKi9cbiAgdGFpbDogTFZpZXd8TENvbnRhaW5lcnxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCBzaWJsaW5nIExWaWV3IG9yIExDb250YWluZXIuXG4gICAqXG4gICAqIEFsbG93cyB1cyB0byBwcm9wYWdhdGUgYmV0d2VlbiBzaWJsaW5nIHZpZXcgc3RhdGVzIHRoYXQgYXJlbid0IGluIHRoZSBzYW1lXG4gICAqIGNvbnRhaW5lci4gRW1iZWRkZWQgdmlld3MgYWxyZWFkeSBoYXZlIGEgbm9kZS5uZXh0LCBidXQgaXQgaXMgb25seSBzZXQgZm9yXG4gICAqIHZpZXdzIGluIHRoZSBzYW1lIGNvbnRhaW5lci4gV2UgbmVlZCBhIHdheSB0byBsaW5rIGNvbXBvbmVudCB2aWV3cyBhbmQgdmlld3NcbiAgICogYWNyb3NzIGNvbnRhaW5lcnMgYXMgd2VsbC5cbiAgICovXG4gIG5leHQ6IExWaWV3fExDb250YWluZXJ8bnVsbDtcblxuICAvKipcbiAgICogVGhpcyBhcnJheSBzdG9yZXMgYWxsIGVsZW1lbnQvdGV4dC9jb250YWluZXIgbm9kZXMgY3JlYXRlZCBpbnNpZGUgdGhpcyB2aWV3XG4gICAqIGFuZCB0aGVpciBiaW5kaW5ncy4gU3RvcmVkIGFzIGFuIGFycmF5IHJhdGhlciB0aGFuIGEgbGlua2VkIGxpc3Qgc28gd2UgY2FuXG4gICAqIGxvb2sgdXAgbm9kZXMgZGlyZWN0bHkgaW4gdGhlIGNhc2Ugb2YgZm9yd2FyZCBkZWNsYXJhdGlvbiBvciBiaW5kaW5nc1xuICAgKiAoZS5nLiBFKDEpKS5cbiAgICpcbiAgICogQWxsIGJpbmRpbmdzIGZvciBhIGdpdmVuIHZpZXcgYXJlIHN0b3JlZCBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleVxuICAgKiBhcHBlYXIgaW4gdGhlIHRlbXBsYXRlLCBzdGFydGluZyB3aXRoIGBiaW5kaW5nU3RhcnRJbmRleGAuXG4gICAqIFdlIHVzZSBgYmluZGluZ0luZGV4YCB0byBpbnRlcm5hbGx5IGtlZXAgdHJhY2sgb2Ygd2hpY2ggYmluZGluZ1xuICAgKiBpcyBjdXJyZW50bHkgYWN0aXZlLlxuICAgKi9cbiAgcmVhZG9ubHkgZGF0YTogYW55W107XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGRpcmVjdGl2ZSBpbnN0YW5jZXMgaW4gdGhlIGN1cnJlbnQgdmlldy5cbiAgICpcbiAgICogVGhlc2UgbXVzdCBiZSBzdG9yZWQgc2VwYXJhdGVseSBmcm9tIExOb2RlcyBiZWNhdXNlIHRoZWlyIHByZXNlbmNlIGlzXG4gICAqIHVua25vd24gYXQgY29tcGlsZS10aW1lIGFuZCB0aHVzIHNwYWNlIGNhbm5vdCBiZSByZXNlcnZlZCBpbiBkYXRhW10uXG4gICAqL1xuICBkaXJlY3RpdmVzOiBhbnlbXXxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgc3RhdGljIGRhdGEgZm9yIHRoaXMgdmlldy4gV2UgbmVlZCBhIHJlZmVyZW5jZSB0byB0aGlzIHNvIHdlIGNhbiBlYXNpbHkgd2FsayB1cCB0aGVcbiAgICogbm9kZSB0cmVlIGluIERJIGFuZCBnZXQgdGhlIFRWaWV3LmRhdGEgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIGEgbm9kZSAod2hlcmUgdGhlXG4gICAqIGRpcmVjdGl2ZSBkZWZzIGFyZSBzdG9yZWQpLlxuICAgKi9cbiAgdFZpZXc6IFRWaWV3O1xuXG4gIC8qKlxuICAgKiBGb3IgZHluYW1pY2FsbHkgaW5zZXJ0ZWQgdmlld3MsIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiB0byByZWZyZXNoIHRoZSB2aWV3LlxuICAgKi9cbiAgdGVtcGxhdGU6IENvbXBvbmVudFRlbXBsYXRlPHt9PnxudWxsO1xuXG4gIC8qKlxuICAgKiAtIEZvciBlbWJlZGRlZCB2aWV3cywgdGhlIGNvbnRleHQgd2l0aCB3aGljaCB0byByZW5kZXIgdGhlIHRlbXBsYXRlLlxuICAgKiAtIEZvciByb290IHZpZXcgb2YgdGhlIHJvb3QgY29tcG9uZW50IHRoZSBjb250ZXh0IGNvbnRhaW5zIGNoYW5nZSBkZXRlY3Rpb24gZGF0YS5cbiAgICogLSBgbnVsbGAgb3RoZXJ3aXNlLlxuICAgKi9cbiAgY29udGV4dDoge318Um9vdENvbnRleHR8bnVsbDtcblxuICAvKipcbiAgICogQSBjb3VudCBvZiBkeW5hbWljIHZpZXdzIHRoYXQgYXJlIGNoaWxkcmVuIG9mIHRoaXMgdmlldyAoaW5kaXJlY3RseSB2aWEgY29udGFpbmVycykuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCB0byBkZWNpZGUgd2hldGhlciB0byBzY2FuIGNoaWxkcmVuIG9mIHRoaXMgdmlldyB3aGVuIHJlZnJlc2hpbmcgZHluYW1pYyB2aWV3c1xuICAgKiBhZnRlciByZWZyZXNoaW5nIHRoZSB2aWV3IGl0c2VsZi5cbiAgICovXG4gIGR5bmFtaWNWaWV3Q291bnQ6IG51bWJlcjtcblxuICAvKipcbiAgICogUXVlcmllcyBhY3RpdmUgZm9yIHRoaXMgdmlldyAtIG5vZGVzIGZyb20gYSB2aWV3IGFyZSByZXBvcnRlZCB0byB0aG9zZSBxdWVyaWVzXG4gICAqL1xuICBxdWVyaWVzOiBMUXVlcmllc3xudWxsO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBNb2R1bGUgSW5qZWN0b3IgdG8gYmUgdXNlZCBhcyBmYWxsIGJhY2sgYWZ0ZXIgRWxlbWVudCBJbmplY3RvcnMgYXJlIGNvbnN1bHRlZC5cbiAgICovXG4gIGluamVjdG9yOiBJbmplY3RvcnxudWxsO1xufVxuXG4vKiogRmxhZ3MgYXNzb2NpYXRlZCB3aXRoIGFuIExWaWV3IChzYXZlZCBpbiBMVmlldy5mbGFncykgKi9cbmV4cG9ydCBjb25zdCBlbnVtIExWaWV3RmxhZ3Mge1xuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdGhlIHZpZXcgaXMgaW4gY3JlYXRpb25Nb2RlLlxuICAgKlxuICAgKiBUaGlzIG11c3QgYmUgc3RvcmVkIGluIHRoZSB2aWV3IHJhdGhlciB0aGFuIHVzaW5nIGBkYXRhYCBhcyBhIG1hcmtlciBzbyB0aGF0XG4gICAqIHdlIGNhbiBwcm9wZXJseSBzdXBwb3J0IGVtYmVkZGVkIHZpZXdzLiBPdGhlcndpc2UsIHdoZW4gZXhpdGluZyBhIGNoaWxkIHZpZXdcbiAgICogYmFjayBpbnRvIHRoZSBwYXJlbnQgdmlldywgYGRhdGFgIHdpbGwgYmUgZGVmaW5lZCBhbmQgYGNyZWF0aW9uTW9kZWAgd2lsbCBiZVxuICAgKiBpbXByb3Blcmx5IHJlcG9ydGVkIGFzIGZhbHNlLlxuICAgKi9cbiAgQ3JlYXRpb25Nb2RlID0gMGIwMDAxLFxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgdmlldyBoYXMgZGVmYXVsdCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5IChjaGVja3MgYWx3YXlzKSBvciBvblB1c2ggKi9cbiAgQ2hlY2tBbHdheXMgPSAwYjAwMTAsXG5cbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRoaXMgdmlldyBpcyBjdXJyZW50bHkgZGlydHkgKG5lZWRpbmcgY2hlY2spICovXG4gIERpcnR5ID0gMGIwMTAwLFxuXG4gIC8qKiBXaGV0aGVyIG9yIG5vdCB0aGlzIHZpZXcgaXMgY3VycmVudGx5IGF0dGFjaGVkIHRvIGNoYW5nZSBkZXRlY3Rpb24gdHJlZS4gKi9cbiAgQXR0YWNoZWQgPSAwYjEwMDAsXG59XG5cbi8qKiBJbnRlcmZhY2UgbmVjZXNzYXJ5IHRvIHdvcmsgd2l0aCB2aWV3IHRyZWUgdHJhdmVyc2FsICovXG5leHBvcnQgaW50ZXJmYWNlIExWaWV3T3JMQ29udGFpbmVyIHtcbiAgbmV4dDogTFZpZXd8TENvbnRhaW5lcnxudWxsO1xuICBjaGlsZD86IExWaWV3fExDb250YWluZXJ8bnVsbDtcbiAgdmlld3M/OiBMVmlld05vZGVbXTtcbiAgcGFyZW50OiBMVmlld3xudWxsO1xufVxuXG4vKipcbiAqIFRoZSBzdGF0aWMgZGF0YSBmb3IgYW4gTFZpZXcgKHNoYXJlZCBiZXR3ZWVuIGFsbCB0ZW1wbGF0ZXMgb2YgYVxuICogZ2l2ZW4gdHlwZSkuXG4gKlxuICogU3RvcmVkIG9uIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBhcyBuZ1ByaXZhdGVEYXRhLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRWaWV3IHtcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRoaXMgdGVtcGxhdGUgaGFzIGJlZW4gcHJvY2Vzc2VkLiAqL1xuICBmaXJzdFRlbXBsYXRlUGFzczogYm9vbGVhbjtcblxuICAvKiogU3RhdGljIGRhdGEgZXF1aXZhbGVudCBvZiBMVmlldy5kYXRhW10uIENvbnRhaW5zIFROb2Rlcy4gKi9cbiAgZGF0YTogVERhdGE7XG5cbiAgLyoqXG4gICAqIFNlbGVjdG9yIG1hdGNoZXMgZm9yIGEgbm9kZSBhcmUgdGVtcG9yYXJpbHkgY2FjaGVkIG9uIHRoZSBUVmlldyBzbyB0aGVcbiAgICogREkgc3lzdGVtIGNhbiBlYWdlcmx5IGluc3RhbnRpYXRlIGRpcmVjdGl2ZXMgb24gdGhlIHNhbWUgbm9kZSBpZiB0aGV5IGFyZVxuICAgKiBjcmVhdGVkIG91dCBvZiBvcmRlci4gVGhleSBhcmUgb3ZlcndyaXR0ZW4gYWZ0ZXIgZWFjaCBub2RlLlxuICAgKlxuICAgKiA8ZGl2IGRpckEgZGlyQj48L2Rpdj5cbiAgICpcbiAgICogZS5nLiBEaXJBIGluamVjdHMgRGlyQiwgYnV0IERpckEgaXMgY3JlYXRlZCBmaXJzdC4gREkgc2hvdWxkIGluc3RhbnRpYXRlXG4gICAqIERpckIgd2hlbiBpdCBmaW5kcyB0aGF0IGl0J3Mgb24gdGhlIHNhbWUgbm9kZSwgYnV0IG5vdCB5ZXQgY3JlYXRlZC5cbiAgICpcbiAgICogRXZlbiBpbmRpY2VzOiBEaXJlY3RpdmUgZGVmc1xuICAgKiBPZGQgaW5kaWNlczpcbiAgICogICAtIE51bGwgaWYgdGhlIGFzc29jaWF0ZWQgZGlyZWN0aXZlIGhhc24ndCBiZWVuIGluc3RhbnRpYXRlZCB5ZXRcbiAgICogICAtIERpcmVjdGl2ZSBpbmRleCwgaWYgYXNzb2NpYXRlZCBkaXJlY3RpdmUgaGFzIGJlZW4gY3JlYXRlZFxuICAgKiAgIC0gU3RyaW5nLCB0ZW1wb3JhcnkgJ0NJUkNVTEFSJyB0b2tlbiBzZXQgd2hpbGUgZGVwZW5kZW5jaWVzIGFyZSBiZWluZyByZXNvbHZlZFxuICAgKi9cbiAgY3VycmVudE1hdGNoZXM6IEN1cnJlbnRNYXRjaGVzTGlzdHxudWxsO1xuXG4gIC8qKlxuICAgKiBEaXJlY3RpdmUgYW5kIGNvbXBvbmVudCBkZWZzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gbWF0Y2hlZCB0byBub2RlcyBvblxuICAgKiB0aGlzIHZpZXcuXG4gICAqXG4gICAqIERlZnMgYXJlIHN0b3JlZCBhdCB0aGUgc2FtZSBpbmRleCBpbiBUVmlldy5kaXJlY3RpdmVzW10gYXMgdGhlaXIgaW5zdGFuY2VzXG4gICAqIGFyZSBzdG9yZWQgaW4gTFZpZXcuZGlyZWN0aXZlc1tdLiBUaGlzIHNpbXBsaWZpZXMgbG9va3VwIGluIERJLlxuICAgKi9cbiAgZGlyZWN0aXZlczogRGlyZWN0aXZlRGVmTGlzdHxudWxsO1xuXG4gIC8qKlxuICAgKiBGdWxsIHJlZ2lzdHJ5IG9mIGRpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudHMgdGhhdCBtYXkgYmUgZm91bmQgaW4gdGhpcyB2aWV3LlxuICAgKlxuICAgKiBJdCdzIG5lY2Vzc2FyeSB0byBrZWVwIGEgY29weSBvZiB0aGUgZnVsbCBkZWYgbGlzdCBvbiB0aGUgVFZpZXcgc28gaXQncyBwb3NzaWJsZVxuICAgKiB0byByZW5kZXIgdGVtcGxhdGUgZnVuY3Rpb25zIHdpdGhvdXQgYSBob3N0IGNvbXBvbmVudC5cbiAgICovXG4gIGRpcmVjdGl2ZVJlZ2lzdHJ5OiBEaXJlY3RpdmVEZWZMaXN0fG51bGw7XG5cbiAgLyoqXG4gICAqIEZ1bGwgcmVnaXN0cnkgb2YgcGlwZXMgdGhhdCBtYXkgYmUgZm91bmQgaW4gdGhpcyB2aWV3LlxuICAgKlxuICAgKiBUaGUgcHJvcGVydHkgaXMgZWl0aGVyIGFuIGFycmF5IG9mIGBQaXBlRGVmc2BzIG9yIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyB0aGUgYXJyYXkgb2ZcbiAgICogYFBpcGVEZWZzYHMuIFRoZSBmdW5jdGlvbiBpcyBuZWNlc3NhcnkgdG8gYmUgYWJsZSB0byBzdXBwb3J0IGZvcndhcmQgZGVjbGFyYXRpb25zLlxuICAgKlxuICAgKiBJdCdzIG5lY2Vzc2FyeSB0byBrZWVwIGEgY29weSBvZiB0aGUgZnVsbCBkZWYgbGlzdCBvbiB0aGUgVFZpZXcgc28gaXQncyBwb3NzaWJsZVxuICAgKiB0byByZW5kZXIgdGVtcGxhdGUgZnVuY3Rpb25zIHdpdGhvdXQgYSBob3N0IGNvbXBvbmVudC5cbiAgICovXG4gIHBpcGVSZWdpc3RyeTogUGlwZURlZkxpc3R8bnVsbDtcblxuICAvKipcbiAgICogQXJyYXkgb2YgbmdPbkluaXQgYW5kIG5nRG9DaGVjayBob29rcyB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCBmb3IgdGhpcyB2aWV3IGluXG4gICAqIGNyZWF0aW9uIG1vZGUuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogRGlyZWN0aXZlIGluZGV4XG4gICAqIE9kZCBpbmRpY2VzOiBIb29rIGZ1bmN0aW9uXG4gICAqL1xuICBpbml0SG9va3M6IEhvb2tEYXRhfG51bGw7XG5cbiAgLyoqXG4gICAqIEFycmF5IG9mIG5nRG9DaGVjayBob29rcyB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCBmb3IgdGhpcyB2aWV3IGluIHVwZGF0ZSBtb2RlLlxuICAgKlxuICAgKiBFdmVuIGluZGljZXM6IERpcmVjdGl2ZSBpbmRleFxuICAgKiBPZGQgaW5kaWNlczogSG9vayBmdW5jdGlvblxuICAgKi9cbiAgY2hlY2tIb29rczogSG9va0RhdGF8bnVsbDtcblxuICAvKipcbiAgICogQXJyYXkgb2YgbmdBZnRlckNvbnRlbnRJbml0IGFuZCBuZ0FmdGVyQ29udGVudENoZWNrZWQgaG9va3MgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWRcbiAgICogZm9yIHRoaXMgdmlldyBpbiBjcmVhdGlvbiBtb2RlLlxuICAgKlxuICAgKiBFdmVuIGluZGljZXM6IERpcmVjdGl2ZSBpbmRleFxuICAgKiBPZGQgaW5kaWNlczogSG9vayBmdW5jdGlvblxuICAgKi9cbiAgY29udGVudEhvb2tzOiBIb29rRGF0YXxudWxsO1xuXG4gIC8qKlxuICAgKiBBcnJheSBvZiBuZ0FmdGVyQ29udGVudENoZWNrZWQgaG9va3MgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWQgZm9yIHRoaXMgdmlldyBpbiB1cGRhdGVcbiAgICogbW9kZS5cbiAgICpcbiAgICogRXZlbiBpbmRpY2VzOiBEaXJlY3RpdmUgaW5kZXhcbiAgICogT2RkIGluZGljZXM6IEhvb2sgZnVuY3Rpb25cbiAgICovXG4gIGNvbnRlbnRDaGVja0hvb2tzOiBIb29rRGF0YXxudWxsO1xuXG4gIC8qKlxuICAgKiBBcnJheSBvZiBuZ0FmdGVyVmlld0luaXQgYW5kIG5nQWZ0ZXJWaWV3Q2hlY2tlZCBob29rcyB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCBmb3JcbiAgICogdGhpcyB2aWV3IGluIGNyZWF0aW9uIG1vZGUuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogRGlyZWN0aXZlIGluZGV4XG4gICAqIE9kZCBpbmRpY2VzOiBIb29rIGZ1bmN0aW9uXG4gICAqL1xuICB2aWV3SG9va3M6IEhvb2tEYXRhfG51bGw7XG5cbiAgLyoqXG4gICAqIEFycmF5IG9mIG5nQWZ0ZXJWaWV3Q2hlY2tlZCBob29rcyB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCBmb3IgdGhpcyB2aWV3IGluXG4gICAqIHVwZGF0ZSBtb2RlLlxuICAgKlxuICAgKiBFdmVuIGluZGljZXM6IERpcmVjdGl2ZSBpbmRleFxuICAgKiBPZGQgaW5kaWNlczogSG9vayBmdW5jdGlvblxuICAgKi9cbiAgdmlld0NoZWNrSG9va3M6IEhvb2tEYXRhfG51bGw7XG5cbiAgLyoqXG4gICAqIEFycmF5IG9mIG5nT25EZXN0cm95IGhvb2tzIHRoYXQgc2hvdWxkIGJlIGV4ZWN1dGVkIHdoZW4gdGhpcyB2aWV3IGlzIGRlc3Ryb3llZC5cbiAgICpcbiAgICogRXZlbiBpbmRpY2VzOiBEaXJlY3RpdmUgaW5kZXhcbiAgICogT2RkIGluZGljZXM6IEhvb2sgZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3lIb29rczogSG9va0RhdGF8bnVsbDtcblxuICAvKipcbiAgICogQXJyYXkgb2YgcGlwZSBuZ09uRGVzdHJveSBob29rcyB0aGF0IHNob3VsZCBiZSBleGVjdXRlZCB3aGVuIHRoaXMgdmlldyBpcyBkZXN0cm95ZWQuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogSW5kZXggb2YgcGlwZSBpbiBkYXRhXG4gICAqIE9kZCBpbmRpY2VzOiBIb29rIGZ1bmN0aW9uXG4gICAqXG4gICAqIFRoZXNlIG11c3QgYmUgc3RvcmVkIHNlcGFyYXRlbHkgZnJvbSBkaXJlY3RpdmUgZGVzdHJveSBob29rcyBiZWNhdXNlIHRoZWlyIGNvbnRleHRzXG4gICAqIGFyZSBzdG9yZWQgaW4gZGF0YS5cbiAgICovXG4gIHBpcGVEZXN0cm95SG9va3M6IEhvb2tEYXRhfG51bGw7XG5cbiAgLyoqXG4gICAqIEEgbGlzdCBvZiBkaXJlY3RpdmUgYW5kIGVsZW1lbnQgaW5kaWNlcyBmb3IgY2hpbGQgY29tcG9uZW50cyB0aGF0IHdpbGwgbmVlZCB0byBiZVxuICAgKiByZWZyZXNoZWQgd2hlbiB0aGUgY3VycmVudCB2aWV3IGhhcyBmaW5pc2hlZCBpdHMgY2hlY2suXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogRGlyZWN0aXZlIGluZGljZXNcbiAgICogT2RkIGluZGljZXM6IEVsZW1lbnQgaW5kaWNlc1xuICAgKi9cbiAgY29tcG9uZW50czogbnVtYmVyW118bnVsbDtcblxuICAvKipcbiAgICogQSBsaXN0IG9mIGluZGljZXMgZm9yIGNoaWxkIGRpcmVjdGl2ZXMgdGhhdCBoYXZlIGhvc3QgYmluZGluZ3MuXG4gICAqXG4gICAqIEV2ZW4gaW5kaWNlczogRGlyZWN0aXZlIGluZGljZXNcbiAgICogT2RkIGluZGljZXM6IEVsZW1lbnQgaW5kaWNlc1xuICAgKi9cbiAgaG9zdEJpbmRpbmdzOiBudW1iZXJbXXxudWxsO1xufVxuXG4vKipcbiAqIFJvb3RDb250ZXh0IGNvbnRhaW5zIGluZm9ybWF0aW9uIHdoaWNoIGlzIHNoYXJlZCBmb3IgYWxsIGNvbXBvbmVudHMgd2hpY2hcbiAqIHdlcmUgYm9vdHN0cmFwcGVkIHdpdGgge0BsaW5rIHJlbmRlckNvbXBvbmVudH0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUm9vdENvbnRleHQge1xuICAvKipcbiAgICogQSBmdW5jdGlvbiB1c2VkIGZvciBzY2hlZHVsaW5nIGNoYW5nZSBkZXRlY3Rpb24gaW4gdGhlIGZ1dHVyZS4gVXN1YWxseVxuICAgKiB0aGlzIGlzIGByZXF1ZXN0QW5pbWF0aW9uRnJhbWVgLlxuICAgKi9cbiAgc2NoZWR1bGVyOiAod29ya0ZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4gIC8qKlxuICAgKiBBIHByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgd2hlbiBhbGwgY29tcG9uZW50cyBhcmUgY29uc2lkZXJlZCBjbGVhbiAobm90IGRpcnR5KS5cbiAgICpcbiAgICogVGhpcyBwcm9taXNlIGlzIG92ZXJ3cml0dGVuIGV2ZXJ5IHRpbWUgYSBmaXJzdCBjYWxsIHRvIHtAbGluayBtYXJrRGlydHl9IGlzIGludm9rZWQuXG4gICAqL1xuICBjbGVhbjogUHJvbWlzZTxudWxsPjtcblxuICAvKipcbiAgICogUm9vdENvbXBvbmVudCAtIFRoZSBjb21wb25lbnQgd2hpY2ggd2FzIGluc3RhbnRpYXRlZCBieSB0aGUgY2FsbCB0b1xuICAgKiB7QGxpbmsgcmVuZGVyQ29tcG9uZW50fS5cbiAgICovXG4gIGNvbXBvbmVudDoge307XG59XG5cbi8qKlxuICogQXJyYXkgb2YgaG9va3MgdGhhdCBzaG91bGQgYmUgZXhlY3V0ZWQgZm9yIGEgdmlldyBhbmQgdGhlaXIgZGlyZWN0aXZlIGluZGljZXMuXG4gKlxuICogRXZlbiBpbmRpY2VzOiBEaXJlY3RpdmUgaW5kZXhcbiAqIE9kZCBpbmRpY2VzOiBIb29rIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEhvb2tEYXRhID0gKG51bWJlciB8ICgoKSA9PiB2b2lkKSlbXTtcblxuLyoqIFBvc3NpYmxlIHZhbHVlcyBvZiBMVmlldy5saWZlY3ljbGVTdGFnZSwgdXNlZCB0byBkZXRlcm1pbmUgd2hpY2ggaG9va3MgdG8gcnVuLiAgKi9cbi8vIFRPRE86IFJlbW92ZSB0aGlzIGVudW0gd2hlbiBjb250YWluZXJSZWZyZXNoIGluc3RydWN0aW9ucyBhcmUgcmVtb3ZlZFxuZXhwb3J0IGNvbnN0IGVudW0gTGlmZWN5Y2xlU3RhZ2Uge1xuXG4gIC8qIEluaXQgaG9va3MgbmVlZCB0byBiZSBydW4sIGlmIGFueS4gKi9cbiAgSW5pdCA9IDEsXG5cbiAgLyogQ29udGVudCBob29rcyBuZWVkIHRvIGJlIHJ1biwgaWYgYW55LiBJbml0IGhvb2tzIGhhdmUgYWxyZWFkeSBydW4uICovXG4gIEFmdGVySW5pdCA9IDIsXG59XG5cbi8qKlxuICogU3RhdGljIGRhdGEgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgaW5zdGFuY2Utc3BlY2lmaWMgZGF0YSBhcnJheSBvbiBhbiBMVmlldy5cbiAqXG4gKiBFYWNoIG5vZGUncyBzdGF0aWMgZGF0YSBpcyBzdG9yZWQgaW4gdERhdGEgYXQgdGhlIHNhbWUgaW5kZXggdGhhdCBpdCdzIHN0b3JlZFxuICogaW4gdGhlIGRhdGEgYXJyYXkuIEVhY2ggcGlwZSdzIGRlZmluaXRpb24gaXMgc3RvcmVkIGhlcmUgYXQgdGhlIHNhbWUgaW5kZXhcbiAqIGFzIGl0cyBwaXBlIGluc3RhbmNlIGluIHRoZSBkYXRhIGFycmF5LiBBbnkgbm9kZXMgdGhhdCBkbyBub3QgaGF2ZSBzdGF0aWNcbiAqIGRhdGEgc3RvcmUgYSBudWxsIHZhbHVlIGluIHREYXRhIHRvIGF2b2lkIGEgc3BhcnNlIGFycmF5LlxuICovXG5leHBvcnQgdHlwZSBURGF0YSA9IChUTm9kZSB8IFBpcGVEZWY8YW55PnwgbnVsbClbXTtcblxuLyoqIFR5cGUgZm9yIFRWaWV3LmN1cnJlbnRNYXRjaGVzICovXG5leHBvcnQgdHlwZSBDdXJyZW50TWF0Y2hlc0xpc3QgPSBbRGlyZWN0aXZlRGVmPGFueT4sIChzdHJpbmcgfCBudW1iZXIgfCBudWxsKV07XG5cbi8vIE5vdGU6IFRoaXMgaGFjayBpcyBuZWNlc3Nhcnkgc28gd2UgZG9uJ3QgZXJyb25lb3VzbHkgZ2V0IGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxuLy8gZmFpbHVyZSBiYXNlZCBvbiB0eXBlcy5cbmV4cG9ydCBjb25zdCB1bnVzZWRWYWx1ZUV4cG9ydFRvUGxhY2F0ZUFqZCA9IDE7XG4iXX0=