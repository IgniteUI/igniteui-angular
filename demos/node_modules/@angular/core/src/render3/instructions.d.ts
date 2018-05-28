/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import './ng_dev_mode';
import { LContainer } from './interfaces/container';
import { LInjector } from './interfaces/injector';
import { CssSelectorList, LProjection } from './interfaces/projection';
import { LQueries } from './interfaces/query';
import { CurrentMatchesList, LView, LViewFlags, RootContext, TView } from './interfaces/view';
import { LContainerNode, LElementNode, LNode, LNodeType, LProjectionNode, LTextNode, LViewNode, TNode } from './interfaces/node';
import { ComponentDef, ComponentTemplate, DirectiveDef, DirectiveDefList, DirectiveDefListOrFactory, PipeDefList, PipeDefListOrFactory, RenderFlags } from './interfaces/definition';
import { RElement, RText, Renderer3, RendererFactory3 } from './interfaces/renderer';
/**
 * Directive (D) sets a property on all component instances using this constant as a key and the
 * component's host node (LElement) as the value. This is used in methods like detectChanges to
 * facilitate jumping from an instance to the host node.
 */
export declare const NG_HOST_SYMBOL = "__ngHostLNode__";
/**
 * Function used to sanitize the value before writing it into the renderer.
 */
export declare type Sanitizer = (value: any) => string;
/**
 * Directive and element indices for top-level directive.
 *
 * Saved here to avoid re-instantiating an array on every change detection run.
 */
export declare const _ROOT_DIRECTIVE_INDICES: number[];
/**
 * Token set in currentMatches while dependencies are being resolved.
 *
 * If we visit a directive that has a value set to CIRCULAR, we know we've
 * already seen it, and thus have a circular dependency.
 */
export declare const CIRCULAR = "__CIRCULAR__";
export declare function getRenderer(): Renderer3;
export declare function getPreviousOrParentNode(): LNode;
export declare function getCurrentQueries(QueryType: {
    new (): LQueries;
}): LQueries;
export declare function getCreationMode(): boolean;
/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export declare function enterView(newView: LView, host: LElementNode | LViewNode | null): LView;
/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 */
export declare function leaveView(newView: LView): void;
/** Sets the host bindings for the current view. */
export declare function setHostBindings(bindings: number[] | null): void;
export declare function executeInitAndContentHooks(): void;
export declare function createLView<T>(viewId: number, renderer: Renderer3, tView: TView, template: ComponentTemplate<T> | null, context: T | null, flags: LViewFlags): LView;
/**
 * Creation of LNode object is extracted to a separate function so we always create LNode object
 * with the same shape
 * (same properties assigned in the same order).
 */
export declare function createLNodeObject(type: LNodeType, currentView: LView, parent: LNode, native: RText | RElement | null | undefined, state: any, queries: LQueries | null): LElementNode & LTextNode & LViewNode & LContainerNode & LProjectionNode;
/**
 * A common way of creating the LNode to make sure that all of them have same shape to
 * keep the execution code monomorphic and fast.
 */
export declare function createLNode(index: number | null, type: LNodeType.Element, native: RElement | RText | null, lView?: LView | null): LElementNode;
export declare function createLNode(index: null, type: LNodeType.View, native: null, lView: LView): LViewNode;
export declare function createLNode(index: number, type: LNodeType.Container, native: undefined, lContainer: LContainer): LContainerNode;
export declare function createLNode(index: number, type: LNodeType.Projection, native: null, lProjection: LProjection): LProjectionNode;
/**
 *
 * @param hostNode Existing node to render into.
 * @param template Template function with the instructions.
 * @param context to pass into the template.
 * @param providedRendererFactory renderer factory to use
 * @param host The host element node to use
 * @param directives Directive defs that should be used for matching
 * @param pipes Pipe defs that should be used for matching
 */
export declare function renderTemplate<T>(hostNode: RElement, template: ComponentTemplate<T>, context: T, providedRendererFactory: RendererFactory3, host: LElementNode | null, directives?: DirectiveDefListOrFactory | null, pipes?: PipeDefListOrFactory | null): LElementNode;
export declare function renderEmbeddedTemplate<T>(viewNode: LViewNode | null, template: ComponentTemplate<T>, context: T, renderer: Renderer3, directives?: DirectiveDefList | null, pipes?: PipeDefList | null): LViewNode;
export declare function renderComponentOrTemplate<T>(node: LElementNode, hostView: LView, componentOrContext: T, template?: ComponentTemplate<T>): void;
/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes to be written into the DOM element on creation.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export declare function elementStart(index: number, name: string, attrs?: string[] | null, localRefs?: string[] | null): RElement;
export declare function resolveDirective(def: DirectiveDef<any>, valueIndex: number, matches: CurrentMatchesList, tView: TView): any;
/** Sets the context for a ChangeDetectorRef to the given instance. */
export declare function initChangeDetectorIfExisting(injector: LInjector | null, instance: any, view: LView): void;
export declare function isComponent(tNode: TNode): boolean;
/** Creates a TView instance */
export declare function createTView(defs: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null): TView;
export declare function createError(text: string, token: any): Error;
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export declare function locateHostElement(factory: RendererFactory3, elementOrSelector: RElement | string): RElement | null;
/**
 * Creates the host LNode.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 *
 * @returns LElementNode created
 */
export declare function hostElement(tag: string, rNode: RElement | null, def: ComponentDef<any>): LElementNode;
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener.
 */
export declare function listener(eventName: string, listenerFn: (e?: any) => any, useCapture?: boolean): void;
/** Mark the end of the element. */
export declare function elementEnd(): void;
/**
 * Updates the value of removes an attribute on an Element.
 *
 * @param number index The index of the element in the data array
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 */
export declare function elementAttribute(index: number, name: string, value: any, sanitizer?: Sanitizer): void;
/**
 * Update a property on an Element.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 */
export declare function elementProperty<T>(index: number, propName: string, value: T | NO_CHANGE, sanitizer?: Sanitizer): void;
/**
 * Add or remove a class in a `classList` on a DOM element.
 *
 * This instruction is meant to handle the [class.foo]="exp" case
 *
 * @param index The index of the element to update in the data array
 * @param className Name of class to toggle. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value A value indicating if a given class should be added or removed.
 */
export declare function elementClassNamed<T>(index: number, className: string, value: T | NO_CHANGE): void;
/**
 * Set the `className` property on a DOM element.
 *
 * This instruction is meant to handle the `[class]="exp"` usage.
 *
 * `elementClass` instruction writes the value to the "element's" `className` property.
 *
 * @param index The index of the element to update in the data array
 * @param value A value indicating a set of classes which should be applied. The method overrides
 *   any existing classes. The value is stringified (`toString`) before it is applied to the
 *   element.
 */
export declare function elementClass<T>(index: number, value: T | NO_CHANGE): void;
/**
 * Update a given style on an Element.
 *
 * @param index Index of the element to change in the data array
 * @param styleName Name of property. Because it is going to DOM this is not subject to
 *        renaming as part of minification.
 * @param value New value to write (null to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 * @param sanitizer An optional function used to transform the value typically used for
 *        sanitization.
 */
export declare function elementStyleNamed<T>(index: number, styleName: string, value: T | NO_CHANGE, suffix?: string): void;
export declare function elementStyleNamed<T>(index: number, styleName: string, value: T | NO_CHANGE, sanitizer?: Sanitizer): void;
/**
 * Set the `style` property on a DOM element.
 *
 * This instruction is meant to handle the `[style]="exp"` usage.
 *
 *
 * @param index The index of the element to update in the data array
 * @param value A value indicating if a given style should be added or removed.
 *   The expected shape of `value` is an object where keys are style names and the values
 *   are their corresponding values to set. If value is falsy than the style is remove. An absence
 *   of style does not cause that style to be removed. `NO_CHANGE` implies that no update should be
 *   performed.
 */
export declare function elementStyle<T>(index: number, value: {
    [styleName: string]: any;
} | NO_CHANGE): void;
/**
 * Create static text node
 *
 * @param index Index of the node in the data array.
 * @param value Value to write. This value will be stringified.
 *   If value is not provided than the actual creation of the text node is delayed.
 */
export declare function text(index: number, value?: any): void;
/**
 * Create text node with binding
 * Bindings should be handled externally with the proper bind(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 */
export declare function textBinding<T>(index: number, value: T | NO_CHANGE): void;
/**
 * Create a directive.
 *
 * NOTE: directives can be created in order other than the index order. They can also
 *       be retrieved before they are created in which case the value will be null.
 *
 * @param directive The directive instance.
 * @param directiveDef DirectiveDef object which contains information about the template.
 */
export declare function directiveCreate<T>(index: number, directive: T, directiveDef: DirectiveDef<T> | ComponentDef<T>): T;
/**
 * A lighter version of directiveCreate() that is used for the root component
 *
 * This version does not contain features that we don't already support at root in
 * current Angular. Example: local refs and inputs on root component.
 */
export declare function baseDirectiveCreate<T>(index: number, directive: T, directiveDef: DirectiveDef<T> | ComponentDef<T>): T;
export declare function createLContainer(parentLNode: LNode, currentView: LView, template?: ComponentTemplate<any>): LContainer;
/**
 * Creates an LContainerNode.
 *
 * Only `LViewNodes` can go into `LContainerNodes`.
 *
 * @param index The index of the container in the data array
 * @param template Optional inline template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 */
export declare function container(index: number, template?: ComponentTemplate<any>, tagName?: string, attrs?: string[], localRefs?: string[] | null): void;
/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export declare function containerRefreshStart(index: number): void;
/**
 * Marks the end of the LContainerNode.
 *
 * Marking the end of LContainerNode is the time when to child Views get inserted or removed.
 */
export declare function containerRefreshEnd(): void;
/**
 * Marks the start of an embedded view.
 *
 * @param viewBlockId The ID of this view
 * @return boolean Whether or not this view is in creation mode
 */
export declare function embeddedViewStart(viewBlockId: number): RenderFlags;
/** Marks the end of an embedded view. */
export declare function embeddedViewEnd(): void;
/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param directiveIndex
 * @param elementIndex
 */
export declare function componentRefresh<T>(directiveIndex: number, elementIndex: number): void;
/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param selectors A collection of parsed CSS selectors
 * @param rawSelectors A collection of CSS selectors in the raw, un-parsed form
 */
export declare function projectionDef(index: number, selectors?: CssSelectorList[], textSelectors?: string[]): void;
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param localIndex - index under which distribution of projected nodes was memorized
 * @param selectorIndex - 0 means <ng-content> without any selector
 * @param attrs - attributes attached to the ng-content node, if present
 */
export declare function projection(nodeIndex: number, localIndex: number, selectorIndex?: number, attrs?: string[]): void;
/**
 * Adds a LView or a LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param currentView The view where LView or LContainer should be added
 * @param state The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export declare function addToViewTree<T extends LView | LContainer>(currentView: LView, state: T): T;
/** If node is an OnPush component, marks its LView dirty. */
export declare function markDirtyIfOnPush(node: LElementNode): void;
/**
 * Wraps an event listener so its host view and its ancestor views will be marked dirty
 * whenever the event fires. Necessary to support OnPush components.
 */
export declare function wrapListenerWithDirtyLogic(view: LView, listenerFn: (e?: any) => any): (e: Event) => any;
/**
 * Wraps an event listener so its host view and its ancestor views will be marked dirty
 * whenever the event fires. Also wraps with preventDefault behavior.
 */
export declare function wrapListenerWithDirtyAndDefault(view: LView, listenerFn: (e?: any) => any): EventListener;
/** Marks current view and all ancestors dirty */
export declare function markViewDirty(view: LView): void;
/**
 * Used to schedule change detection on the whole application.
 *
 * Unlike `tick`, `scheduleTick` coalesces multiple calls into one change detection run.
 * It is usually called indirectly by calling `markDirty` when the view needs to be
 * re-rendered.
 *
 * Typically `scheduleTick` uses `requestAnimationFrame` to coalesce multiple
 * `scheduleTick` requests. The scheduling function can be overridden in
 * `renderComponent`'s `scheduler` option.
 */
export declare function scheduleTick<T>(rootContext: RootContext): void;
/**
 * Used to perform change detection on the whole application.
 *
 * This is equivalent to `detectChanges`, but invoked on root component. Additionally, `tick`
 * executes lifecycle hooks and conditionally checks components based on their
 * `ChangeDetectionStrategy` and dirtiness.
 *
 * The preferred way to trigger change detection is to call `markDirty`. `markDirty` internally
 * schedules `tick` using a scheduler in order to coalesce multiple `markDirty` calls into a
 * single change detection run. By default, the scheduler is `requestAnimationFrame`, but can
 * be changed when calling `renderComponent` and providing the `scheduler` option.
 */
export declare function tick<T>(component: T): void;
/**
 * Retrieve the root view from any component by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param component any component
 */
export declare function getRootView(component: any): LView;
/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component. There should
 * be very little reason to call this function directly since a preferred way to do change
 * detection is to {@link markDirty} the component and wait for the scheduler to call this method
 * at some future point in time. This is because a single user action often results in many
 * components being invalidated and calling change detection on each component synchronously
 * would be inefficient. It is better to wait until all components are marked as dirty and
 * then perform single change detection across all of the components
 *
 * @param component The component which the change detection should be performed on.
 */
export declare function detectChanges<T>(component: T): void;
/**
 * Checks the change detector and its children, and throws if any changes are detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 */
export declare function checkNoChanges<T>(component: T): void;
/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck. */
export declare function detectChangesInternal<T>(hostView: LView, hostNode: LElementNode, def: ComponentDef<T>, component: T): void;
/**
 * Mark the component as dirty (needing change detection).
 *
 * Marking a component dirty will schedule a change detection on this
 * component at some point in the future. Marking an already dirty
 * component as dirty is a noop. Only one outstanding change detection
 * can be scheduled per component tree. (Two components bootstrapped with
 * separate `renderComponent` will have separate schedulers)
 *
 * When the root component is bootstrapped with `renderComponent`, a scheduler
 * can be provided.
 *
 * @param component Component to mark as dirty.
 */
export declare function markDirty<T>(component: T): void;
export interface NO_CHANGE {
    brand: 'NO_CHANGE';
}
/** A special value which designates that a value has not changed. */
export declare const NO_CHANGE: NO_CHANGE;
/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export declare function bind<T>(value: T | NO_CHANGE): T | NO_CHANGE;
/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export declare function interpolationV(values: any[]): string | NO_CHANGE;
/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export declare function interpolation1(prefix: string, v0: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 2 expressions. */
export declare function interpolation2(prefix: string, v0: any, i0: string, v1: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation bindings with 3 expressions. */
export declare function interpolation3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string | NO_CHANGE;
/** Create an interpolation binding with 4 expressions. */
export declare function interpolation4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 5 expressions. */
export declare function interpolation5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 6 expressions. */
export declare function interpolation6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 7 expressions. */
export declare function interpolation7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string | NO_CHANGE;
/** Creates an interpolation binding with 8 expressions. */
export declare function interpolation8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix: string): string | NO_CHANGE;
/** Store a value in the `data` at a given `index`. */
export declare function store<T>(index: number, value: T): void;
/** Retrieves a value from the `data`. */
export declare function load<T>(index: number): T;
/** Retrieves a value from the `directives` array. */
export declare function loadDirective<T>(index: number): T;
/** Gets the current binding value and increments the binding index. */
export declare function consumeBinding(): any;
/** Updates binding if changed, then returns whether it was updated. */
export declare function bindingUpdated(value: any): boolean;
/** Updates binding if changed, then returns the latest value. */
export declare function checkAndUpdateBinding(value: any): any;
/** Updates 2 bindings if changed, then returns whether either was updated. */
export declare function bindingUpdated2(exp1: any, exp2: any): boolean;
/** Updates 4 bindings if changed, then returns whether any was updated. */
export declare function bindingUpdated4(exp1: any, exp2: any, exp3: any, exp4: any): boolean;
export declare function getTView(): TView;
export declare function getDirectiveInstance<T>(instanceOrArray: T | [T]): T;
export declare function assertPreviousIsParent(): void;
export declare function _getComponentHostLElementNode<T>(component: T): LElementNode;
export declare const CLEAN_PROMISE: Promise<null>;
export declare const ROOT_DIRECTIVE_INDICES: number[];
