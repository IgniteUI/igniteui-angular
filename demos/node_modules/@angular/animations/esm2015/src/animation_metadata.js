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
 * @record
 */
export function ɵStyleData() { }
function ɵStyleData_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [key: string]: string|number;
    */
}
/** @enum {number} */
const AnimationMetadataType = {
    State: 0,
    Transition: 1,
    Sequence: 2,
    Group: 3,
    Animate: 4,
    Keyframes: 5,
    Style: 6,
    Trigger: 7,
    Reference: 8,
    AnimateChild: 9,
    AnimateRef: 10,
    Query: 11,
    Stagger: 12,
};
export { AnimationMetadataType };
/**
 * \@experimental Animation support is experimental.
 */
export const /** @type {?} */ AUTO_STYLE = '*';
/**
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationMetadata() { }
function AnimationMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationMetadata.prototype.type;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link trigger trigger animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationTriggerMetadata() { }
function AnimationTriggerMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTriggerMetadata.prototype.name;
    /** @type {?} */
    AnimationTriggerMetadata.prototype.definitions;
    /** @type {?} */
    AnimationTriggerMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link state state animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationStateMetadata() { }
function AnimationStateMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationStateMetadata.prototype.name;
    /** @type {?} */
    AnimationStateMetadata.prototype.styles;
    /** @type {?|undefined} */
    AnimationStateMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link transition transition animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationTransitionMetadata() { }
function AnimationTransitionMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationTransitionMetadata.prototype.expr;
    /** @type {?} */
    AnimationTransitionMetadata.prototype.animation;
    /** @type {?} */
    AnimationTransitionMetadata.prototype.options;
}
/**
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationReferenceMetadata() { }
function AnimationReferenceMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationReferenceMetadata.prototype.animation;
    /** @type {?} */
    AnimationReferenceMetadata.prototype.options;
}
/**
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationQueryMetadata() { }
function AnimationQueryMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationQueryMetadata.prototype.selector;
    /** @type {?} */
    AnimationQueryMetadata.prototype.animation;
    /** @type {?} */
    AnimationQueryMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link keyframes keyframes animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationKeyframesSequenceMetadata() { }
function AnimationKeyframesSequenceMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationKeyframesSequenceMetadata.prototype.steps;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link style style animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationStyleMetadata() { }
function AnimationStyleMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationStyleMetadata.prototype.styles;
    /** @type {?} */
    AnimationStyleMetadata.prototype.offset;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link animate animate animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationAnimateMetadata() { }
function AnimationAnimateMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationAnimateMetadata.prototype.timings;
    /** @type {?} */
    AnimationAnimateMetadata.prototype.styles;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link animateChild animateChild animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationAnimateChildMetadata() { }
function AnimationAnimateChildMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationAnimateChildMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link useAnimation useAnimation animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationAnimateRefMetadata() { }
function AnimationAnimateRefMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationAnimateRefMetadata.prototype.animation;
    /** @type {?} */
    AnimationAnimateRefMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link sequence sequence animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationSequenceMetadata() { }
function AnimationSequenceMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationSequenceMetadata.prototype.steps;
    /** @type {?} */
    AnimationSequenceMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link group group animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationGroupMetadata() { }
function AnimationGroupMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationGroupMetadata.prototype.steps;
    /** @type {?} */
    AnimationGroupMetadata.prototype.options;
}
/**
 * Metadata representing the entry of animations. Instances of this interface are provided via the
 * animation DSL when the {\@link stagger stagger animation function} is called.
 *
 * \@experimental Animation support is experimental.
 * @record
 */
export function AnimationStaggerMetadata() { }
function AnimationStaggerMetadata_tsickle_Closure_declarations() {
    /** @type {?} */
    AnimationStaggerMetadata.prototype.timings;
    /** @type {?} */
    AnimationStaggerMetadata.prototype.animation;
}
/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {\@link Component#animations component animations metadata page} to gain a better
 * understanding of how animations in Angular are used.
 *
 * `trigger` Creates an animation trigger which will a list of {\@link state state} and
 * {\@link transition transition} entries that will be evaluated when the expression
 * bound to the trigger changes.
 *
 * Triggers are registered within the component annotation data under the
 * {\@link Component#animations animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that
 * the
 * trigger is bound to (in the form of `[\@triggerName]="expression"`.
 *
 * Animation trigger bindings strigify values and then match the previous and current values against
 * any linked transitions. If a boolean value is provided into the trigger binding then it will both
 * be represented as `1` or `true` and `0` or `false` for a true and false boolean values
 * respectively.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {\@link state state} and
 * {\@link transition transition} declarations.
 *
 * ```typescript
 * \@Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger("myAnimationTrigger", [
 *       state(...),
 *       state(...),
 *       transition(...),
 *       transition(...)
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "something";
 * }
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * ### Using an inline function
 * The `transition` animation method also supports reading an inline function which can decide
 * if its associated animation should be run.
 *
 * ```
 * // this method will be run each time the `myAnimationTrigger`
 * // trigger value changes...
 * function myInlineMatcherFn(fromState: string, toState: string, element: any, params: {[key:
 * string]: any}): boolean {
 *   // notice that `element` and `params` are also available here
 *   return toState == 'yes-please-animate';
 * }
 *
 * \@Component({
 *   selector: 'my-component',
 *   templateUrl: 'my-component-tpl.html',
 *   animations: [
 *     trigger('myAnimationTrigger', [
 *       transition(myInlineMatcherFn, [
 *         // the animation sequence code
 *       ]),
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   myStatusExp = "yes-please-animate";
 * }
 * ```
 *
 * The inline method will be run each time the trigger
 * value changes
 *
 * ## Disable Animations
 * A special animation control binding called `\@.disabled` can be placed on an element which will
 * then disable animations for any inner animation triggers situated within the element as well as
 * any animations on the element itself.
 *
 * When true, the `\@.disabled` binding will prevent all animations from rendering. The example
 * below shows how to use this feature:
 *
 * ```ts
 * \@Component({
 *   selector: 'my-component',
 *   template: `
 *     <div [\@.disabled]="isDisabled">
 *       <div [\@childAnimation]="exp"></div>
 *     </div>
 *   `,
 *   animations: [
 *     trigger("childAnimation", [
 *       // ...
 *     ])
 *   ]
 * })
 * class MyComponent {
 *   isDisabled = true;
 *   exp = '...';
 * }
 * ```
 *
 * The `\@childAnimation` trigger will not animate because `\@.disabled` prevents it from happening
 * (when true).
 *
 * Note that `\@.disabled` will only disable all animations (this means any animations running on
 * the same element will also be disabled).
 *
 * ### Disabling Animations Application-wide
 * When an area of the template is set to have animations disabled, **all** inner components will
 * also have their animations disabled as well. This means that all animations for an angular
 * application can be disabled by placing a host binding set on `\@.disabled` on the topmost Angular
 * component.
 *
 * ```ts
 * import {Component, HostBinding} from '\@angular/core';
 *
 * \@Component({
 *   selector: 'app-component',
 *   templateUrl: 'app.component.html',
 * })
 * class AppComponent {
 *   \@HostBinding('\@.disabled')
 *   public animationsDisabled = true;
 * }
 * ```
 *
 * ### What about animations that us `query()` and `animateChild()`?
 * Despite inner animations being disabled, a parent animation can {\@link query query} for inner
 * elements located in disabled areas of the template and still animate them as it sees fit. This is
 * also the case for when a sub animation is queried by a parent and then later animated using {\@link
 * animateChild animateChild}.
 * ### Detecting when an animation is disabled
 * If a region of the DOM (or the entire application) has its animations disabled, then animation
 * trigger callbacks will still fire just as normal (only for zero seconds).
 *
 * When a trigger callback fires it will provide an instance of an {\@link AnimationEvent}. If
 * animations
 * are disabled then the `.disabled` flag on the event will be true.
 *
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} definitions
 * @return {?}
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name, definitions, options: {} };
}
/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {\@link sequence an animation sequence}, {\@link group group}, or {\@link
 * transition transition}.
 *
 * ### Usage
 *
 * The `animate` function accepts two input parameters: `timing` and `styles`:
 *
 * - `timing` is a string based value that can be a combination of a duration with optional delay
 * and easing values. The format for the expression breaks down to `duration delay easing`
 * (therefore a value such as `1s 100ms ease-out` will be parse itself into `duration=1000,
 * delay=100, easing=ease-out`. If a numeric value is provided then that will be used as the
 * `duration` value in millisecond form.
 * - `styles` is the style input data which can either be a call to {\@link style style} or {\@link
 * keyframes keyframes}. If left empty then the styles from the destination state will be collected
 * and used (this is useful when describing an animation step that will complete an animation by
 * {\@link transition#the-final-animate-call animating to the final state}).
 *
 * ```typescript
 * // various functions for specifying timing data
 * animate(500, style(...))
 * animate("1s", style(...))
 * animate("100ms 0.5s", style(...))
 * animate("5s ease", style(...))
 * animate("5s 10ms cubic-bezier(.17,.67,.88,.1)", style(...))
 *
 * // either style() of keyframes() can be used
 * animate(500, style({ background: "red" }))
 * animate(500, keyframes([
 *   style({ background: "blue" })),
 *   style({ background: "red" }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} timings
 * @param {?=} styles
 * @return {?}
 */
export function animate(timings, styles = null) {
    return { type: 4 /* Animate */, styles, timings };
}
/**
 * `group` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different starting/ending times.
 *
 * The `group` function can either be used within a {\@link sequence sequence} or a {\@link transition
 * transition} and it will only continue to the next instruction once all of the inner animation
 * steps have completed.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `group` animation function can either consist of {\@link
 * style style} or {\@link animate animate} function calls. Each call to `style()` or `animate()`
 * within a group will be executed instantly (use {\@link keyframes keyframes} or a {\@link
 * animate#usage animate() with a delay value} to offset styles to be applied at a later time).
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @param {?=} options
 * @return {?}
 */
export function group(steps, options = null) {
    return { type: 3 /* Group */, steps, options };
}
/**
 * `sequence` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used by
 * default when an array is passed as animation data into {\@link transition transition}.)
 *
 * The `sequence` function can either be used within a {\@link group group} or a {\@link transition
 * transition} and it will only continue to the next instruction once each of the inner animation
 * steps have completed.
 *
 * To perform animation styling in parallel with other animation steps then have a look at the
 * {\@link group group} animation function.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `sequence` animation function can either consist of
 * {\@link style style} or {\@link animate animate} function calls. A call to `style()` will apply the
 * provided styling data immediately while a call to `animate()` will apply its styling data over a
 * given time depending on its timing data.
 *
 * ```typescript
 * sequence([
 *   style({ opacity: 0 })),
 *   animate("1s", { opacity: 1 }))
 * ])
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @param {?=} options
 * @return {?}
 */
export function sequence(steps, options = null) {
    return { type: 2 /* Sequence */, steps, options };
}
/**
 * `style` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {\@link state animation states}, within an {\@link sequence animation sequence}, or as styling data
 * for both {\@link animate animate} and {\@link keyframes keyframes}.
 *
 * ### Usage
 *
 * `style` takes in a key/value string map as data and expects one or more CSS property/value pairs
 * to be defined.
 *
 * ```typescript
 * // string values are used for css properties
 * style({ background: "red", color: "blue" })
 *
 * // numerical (pixel) values are also supported
 * style({ width: 100, height: 0 })
 * ```
 *
 * #### Auto-styles (using `*`)
 *
 * When an asterix (`*`) character is used as a value then it will be detected from the element
 * being animated and applied as animation data when the animation starts.
 *
 * This feature proves useful for a state depending on layout and/or environment factors; in such
 * cases the styles are calculated just before the animation starts.
 *
 * ```typescript
 * // the steps below will animate from 0 to the
 * // actual height of the element
 * style({ height: 0 }),
 * animate("1s", style({ height: "*" }))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} tokens
 * @return {?}
 */
export function style(tokens) {
    return { type: 6 /* Style */, styles: tokens, offset: null };
}
/**
 * `state` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `state` declares an animation state within the given trigger. When a state is active within a
 * component then its associated styles will persist on the element that the trigger is attached to
 * (even when the animation ends).
 *
 * To animate between states, have a look at the animation {\@link transition transition} DSL
 * function. To register states to an animation trigger please have a look at the {\@link trigger
 * trigger} function.
 *
 * #### The `void` state
 *
 * The `void` state value is a reserved word that angular uses to determine when the element is not
 * apart of the application anymore (e.g. when an `ngIf` evaluates to false then the state of the
 * associated element is void).
 *
 * #### The `*` (default) state
 *
 * The `*` state (when styled) is a fallback state that will be used if the state that is being
 * animated is not declared within the trigger.
 *
 * ### Usage
 *
 * `state` will declare an animation state with its associated styles
 * within the given trigger.
 *
 * - `stateNameExpr` can be one or more state names separated by commas.
 * - `styles` refers to the {\@link style styling data} that will be persisted on the element once
 * the state has been reached.
 *
 * ```typescript
 * // "void" is a reserved name for a state and is used to represent
 * // the state in which an element is detached from from the application.
 * state("void", style({ height: 0 }))
 *
 * // user-defined states
 * state("closed", style({ height: 0 }))
 * state("open, visible", style({ height: "*" }))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} name
 * @param {?} styles
 * @param {?=} options
 * @return {?}
 */
export function state(name, styles, options) {
    return { type: 0 /* State */, name, styles, options };
}
/**
 * `keyframes` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `keyframes` specifies a collection of {\@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * ### Usage
 *
 * The `keyframes` animation function is designed to be used alongside the {\@link animate animate}
 * animation function. Instead of applying animations from where they are currently to their
 * destination, keyframes can describe how each style entry is applied and at what point within the
 * animation arc (much like CSS Keyframe Animations do).
 *
 * For each `style()` entry an `offset` value can be set. Doing so allows to specify at what
 * percentage of the animate time the styles will be applied.
 *
 * ```typescript
 * // the provided offset values describe when each backgroundColor value is applied.
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red", offset: 0 }),
 *   style({ backgroundColor: "blue", offset: 0.2 }),
 *   style({ backgroundColor: "orange", offset: 0.3 }),
 *   style({ backgroundColor: "black", offset: 1 })
 * ]))
 * ```
 *
 * Alternatively, if there are no `offset` values used within the style entries then the offsets
 * will be calculated automatically.
 *
 * ```typescript
 * animate("5s", keyframes([
 *   style({ backgroundColor: "red" }) // offset = 0
 *   style({ backgroundColor: "blue" }) // offset = 0.33
 *   style({ backgroundColor: "orange" }) // offset = 0.66
 *   style({ backgroundColor: "black" }) // offset = 1
 * ]))
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @return {?}
 */
export function keyframes(steps) {
    return { type: 5 /* Keyframes */, steps };
}
/**
 * `transition` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {\@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `transition` declares the {\@link sequence sequence of animation steps} that will be run when the
 * provided `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 =>
 * state2` which consists of two known states (use an asterix (`*`) to refer to a dynamic starting
 * and/or ending state).
 *
 * A function can also be provided as the `stateChangeExpr` argument for a transition and this
 * function will be executed each time a state change occurs. If the value returned within the
 * function is true then the associated animation will be run.
 *
 * Animation transitions are placed within an {\@link trigger animation trigger}. For an transition
 * to animate to a state value and persist its styles then one or more {\@link state animation
 * states} is expected to be defined.
 *
 * ### Usage
 *
 * An animation transition is kicked off the `stateChangeExpr` predicate evaluates to true based on
 * what the previous state is and what the current state has become. In other words, if a transition
 * is defined that matches the old/current state criteria then the associated animation will be
 * triggered.
 *
 * ```typescript
 * // all transition/state changes are defined within an animation trigger
 * trigger("myAnimationTrigger", [
 *   // if a state is defined then its styles will be persisted when the
 *   // animation has fully completed itself
 *   state("on", style({ background: "green" })),
 *   state("off", style({ background: "grey" })),
 *
 *   // a transition animation that will be kicked off when the state value
 *   // bound to "myAnimationTrigger" changes from "on" to "off"
 *   transition("on => off", animate(500)),
 *
 *   // it is also possible to do run the same animation for both directions
 *   transition("on <=> off", animate(500)),
 *
 *   // or to define multiple states pairs separated by commas
 *   transition("on => off, off => void", animate(500)),
 *
 *   // this is a catch-all state change for when an element is inserted into
 *   // the page and the destination state is unknown
 *   transition("void => *", [
 *     style({ opacity: 0 }),
 *     animate(500)
 *   ]),
 *
 *   // this will capture a state change between any states
 *   transition("* => *", animate("1s 0s")),
 *
 *   // you can also go full out and include a function
 *   transition((fromState, toState) => {
 *     // when `true` then it will allow the animation below to be invoked
 *     return fromState == "off" && toState == "on";
 *   }, animate("1s 0s"))
 * ])
 * ```
 *
 * The template associated with this component will make use of the `myAnimationTrigger` animation
 * trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [\@myAnimationTrigger]="myStatusExp">...</div>
 * ```
 *
 * #### The final `animate` call
 *
 * If the final step within the transition steps is a call to `animate()` that **only** uses a
 * timing value with **no style data** then it will be automatically used as the final animation arc
 * for the element to animate itself to the final state. This involves an automatic mix of
 * adding/removing CSS styles so that the element will be in the exact state it should be for the
 * applied state to be presented correctly.
 *
 * ```
 * // start off by hiding the element, but make sure that it animates properly to whatever state
 * // is currently active for "myAnimationTrigger"
 * transition("void => *", [
 *   style({ opacity: 0 }),
 *   animate(500)
 * ])
 * ```
 *
 * ### Using :enter and :leave
 *
 * Given that enter (insertion) and leave (removal) animations are so common, the `transition`
 * function accepts both `:enter` and `:leave` values which are aliases for the `void => *` and `*
 * => void` state changes.
 *
 * ```
 * transition(":enter", [
 *   style({ opacity: 0 }),
 *   animate(500, style({ opacity: 1 }))
 * ]),
 * transition(":leave", [
 *   animate(500, style({ opacity: 0 }))
 * ])
 * ```
 *
 * ### Boolean values
 * if a trigger binding value is a boolean value then it can be matched using a transition
 * expression that compares `true` and `false` or `1` and `0`.
 *
 * ```
 * // in the template
 * <div [\@openClose]="open ? true : false">...</div>
 *
 * // in the component metadata
 * trigger('openClose', [
 *   state('true', style({ height: '*' })),
 *   state('false', style({ height: '0px' })),
 *   transition('false <=> true', animate(500))
 * ])
 * ```
 *
 * ### Using :increment and :decrement
 * In addition to the :enter and :leave transition aliases, the :increment and :decrement aliases
 * can be used to kick off a transition when a numeric value has increased or decreased in value.
 *
 * ```
 * import {group, animate, query, transition, style, trigger} from '\@angular/animations';
 * import {Component} from '\@angular/core';
 *
 * \@Component({
 *   selector: 'banner-carousel-component',
 *   styles: [`
 *     .banner-container {
 *        position:relative;
 *        height:500px;
 *        overflow:hidden;
 *      }
 *     .banner-container > .banner {
 *        position:absolute;
 *        left:0;
 *        top:0;
 *        font-size:200px;
 *        line-height:500px;
 *        font-weight:bold;
 *        text-align:center;
 *        width:100%;
 *      }
 *   `],
 *   template: `
 *     <button (click)="previous()">Previous</button>
 *     <button (click)="next()">Next</button>
 *     <hr>
 *     <div [\@bannerAnimation]="selectedIndex" class="banner-container">
 *       <div class="banner" *ngFor="let banner of banners"> {{ banner }} </div>
 *     </div>
 *   `,
 *   animations: [
 *     trigger('bannerAnimation', [
 *       transition(":increment", group([
 *         query(':enter', [
 *           style({ left: '100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '-100%' }))
 *         ])
 *       ])),
 *       transition(":decrement", group([
 *         query(':enter', [
 *           style({ left: '-100%' }),
 *           animate('0.5s ease-out', style('*'))
 *         ]),
 *         query(':leave', [
 *           animate('0.5s ease-out', style({ left: '100%' }))
 *         ])
 *       ]))
 *     ])
 *   ]
 * })
 * class BannerCarouselComponent {
 *   allBanners: string[] = ['1', '2', '3', '4'];
 *   selectedIndex: number = 0;
 *
 *   get banners() {
 *      return [this.allBanners[this.selectedIndex]];
 *   }
 *
 *   previous() {
 *     this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
 *   }
 *
 *   next() {
 *     this.selectedIndex = Math.min(this.selectedIndex + 1, this.allBanners.length - 1);
 *   }
 * }
 * ```
 *
 * {\@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * \@experimental Animation support is experimental.
 * @param {?} stateChangeExpr
 * @param {?} steps
 * @param {?=} options
 * @return {?}
 */
export function transition(stateChangeExpr, steps, options = null) {
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options };
}
/**
 * `animation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * `var myAnimation = animation(...)` is designed to produce a reusable animation that can be later
 * invoked in another animation or sequence. Reusable animations are designed to make use of
 * animation parameters and the produced animation can be used via the `useAnimation` method.
 *
 * ```
 * var fadeAnimation = animation([
 *   style({ opacity: '{{ start }}' }),
 *   animate('{{ time }}',
 *     style({ opacity: '{{ end }}'}))
 * ], { params: { time: '1000ms', start: 0, end: 1 }});
 * ```
 *
 * If parameters are attached to an animation then they act as **default parameter values**. When an
 * animation is invoked via `useAnimation` then parameter values are allowed to be passed in
 * directly. If any of the passed in parameter values are missing then the default values will be
 * used.
 *
 * ```
 * useAnimation(fadeAnimation, {
 *   params: {
 *     time: '2s',
 *     start: 1,
 *     end: 0
 *   }
 * })
 * ```
 *
 * If one or more parameter values are missing before animated then an error will be thrown.
 *
 * \@experimental Animation support is experimental.
 * @param {?} steps
 * @param {?=} options
 * @return {?}
 */
export function animation(steps, options = null) {
    return { type: 8 /* Reference */, animation: steps, options };
}
/**
 * `animateChild` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It works by allowing a queried element to execute its own
 * animation within the animation sequence.
 *
 * Each time an animation is triggered in angular, the parent animation
 * will always get priority and any child animations will be blocked. In order
 * for a child animation to run, the parent animation must query each of the elements
 * containing child animations and then allow the animations to run using `animateChild`.
 *
 * The example HTML code below shows both parent and child elements that have animation
 * triggers that will execute at the same time.
 *
 * ```html
 * <!-- parent-child.component.html -->
 * <button (click)="exp =! exp">Toggle</button>
 * <hr>
 *
 * <div [\@parentAnimation]="exp">
 *   <header>Hello</header>
 *   <div [\@childAnimation]="exp">
 *       one
 *   </div>
 *   <div [\@childAnimation]="exp">
 *       two
 *   </div>
 *   <div [\@childAnimation]="exp">
 *       three
 *   </div>
 * </div>
 * ```
 *
 * Now when the `exp` value changes to true, only the `parentAnimation` animation will animate
 * because it has priority. However, using `query` and `animateChild` each of the inner animations
 * can also fire:
 *
 * ```ts
 * // parent-child.component.ts
 * import {trigger, transition, animate, style, query, animateChild} from '\@angular/animations';
 * \@Component({
 *   selector: 'parent-child-component',
 *   animations: [
 *     trigger('parentAnimation', [
 *       transition('false => true', [
 *         query('header', [
 *           style({ opacity: 0 }),
 *           animate(500, style({ opacity: 1 }))
 *         ]),
 *         query('\@childAnimation', [
 *           animateChild()
 *         ])
 *       ])
 *     ]),
 *     trigger('childAnimation', [
 *       transition('false => true', [
 *         style({ opacity: 0 }),
 *         animate(500, style({ opacity: 1 }))
 *       ])
 *     ])
 *   ]
 * })
 * class ParentChildCmp {
 *   exp: boolean = false;
 * }
 * ```
 *
 * In the animation code above, when the `parentAnimation` transition kicks off it first queries to
 * find the header element and fades it in. It then finds each of the sub elements that contain the
 * `\@childAnimation` trigger and then allows for their animations to fire.
 *
 * This example can be further extended by using stagger:
 *
 * ```ts
 * query('\@childAnimation', stagger(100, [
 *   animateChild()
 * ]))
 * ```
 *
 * Now each of the sub animations start off with respect to the `100ms` staggering step.
 *
 * ## The first frame of child animations
 * When sub animations are executed using `animateChild` the animation engine will always apply the
 * first frame of every sub animation immediately at the start of the animation sequence. This way
 * the parent animation does not need to set any initial styling data on the sub elements before the
 * sub animations kick off.
 *
 * In the example above the first frame of the `childAnimation`'s `false => true` transition
 * consists of a style of `opacity: 0`. This is applied immediately when the `parentAnimation`
 * animation transition sequence starts. Only then when the `\@childAnimation` is queried and called
 * with `animateChild` will it then animate to its destination of `opacity: 1`.
 *
 * Note that this feature designed to be used alongside {\@link query query()} and it will only work
 * with animations that are assigned using the Angular animation DSL (this means that CSS keyframes
 * and transitions are not handled by this API).
 *
 * \@experimental Animation support is experimental.
 * @param {?=} options
 * @return {?}
 */
export function animateChild(options = null) {
    return { type: 9 /* AnimateChild */, options };
}
/**
 * `useAnimation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is used to kick off a reusable animation that is created using {\@link
 * animation animation()}.
 *
 * \@experimental Animation support is experimental.
 * @param {?} animation
 * @param {?=} options
 * @return {?}
 */
export function useAnimation(animation, options = null) {
    return { type: 10 /* AnimateRef */, animation, options };
}
/**
 * `query` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language.
 *
 * query() is used to find one or more inner elements within the current element that is
 * being animated within the sequence. The provided animation steps are applied
 * to the queried element (by default, an array is provided, then this will be
 * treated as an animation sequence).
 *
 * ### Usage
 *
 * query() is designed to collect multiple elements and works internally by using
 * `element.querySelectorAll`. An additional options object can be provided which
 * can be used to limit the total amount of items to be collected.
 *
 * ```js
 * query('div', [
 *   animate(...),
 *   animate(...)
 * ], { limit: 1 })
 * ```
 *
 * query(), by default, will throw an error when zero items are found. If a query
 * has the `optional` flag set to true then this error will be ignored.
 *
 * ```js
 * query('.some-element-that-may-not-be-there', [
 *   animate(...),
 *   animate(...)
 * ], { optional: true })
 * ```
 *
 * ### Special Selector Values
 *
 * The selector value within a query can collect elements that contain angular-specific
 * characteristics
 * using special pseudo-selectors tokens.
 *
 * These include:
 *
 *  - Querying for newly inserted/removed elements using `query(":enter")`/`query(":leave")`
 *  - Querying all currently animating elements using `query(":animating")`
 *  - Querying elements that contain an animation trigger using `query("\@triggerName")`
 *  - Querying all elements that contain an animation triggers using `query("\@*")`
 *  - Including the current element into the animation sequence using `query(":self")`
 *
 *
 *  Each of these pseudo-selector tokens can be merged together into a combined query selector
 * string:
 *
 *  ```
 *  query(':self, .record:enter, .record:leave, \@subTrigger', [...])
 *  ```
 *
 * ### Demo
 *
 * ```
 * \@Component({
 *   selector: 'inner',
 *   template: `
 *     <div [\@queryAnimation]="exp">
 *       <h1>Title</h1>
 *       <div class="content">
 *         Blah blah blah
 *       </div>
 *     </div>
 *   `,
 *   animations: [
 *    trigger('queryAnimation', [
 *      transition('* => goAnimate', [
 *        // hide the inner elements
 *        query('h1', style({ opacity: 0 })),
 *        query('.content', style({ opacity: 0 })),
 *
 *        // animate the inner elements in, one by one
 *        query('h1', animate(1000, style({ opacity: 1 })),
 *        query('.content', animate(1000, style({ opacity: 1 })),
 *      ])
 *    ])
 *  ]
 * })
 * class Cmp {
 *   exp = '';
 *
 *   goAnimate() {
 *     this.exp = 'goAnimate';
 *   }
 * }
 * ```
 *
 * \@experimental Animation support is experimental.
 * @param {?} selector
 * @param {?} animation
 * @param {?=} options
 * @return {?}
 */
export function query(selector, animation, options = null) {
    return { type: 11 /* Query */, selector, animation, options };
}
/**
 * `stagger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is designed to be used inside of an animation {\@link query query()}
 * and works by issuing a timing gap between after each queried item is animated.
 *
 * ### Usage
 *
 * In the example below there is a container element that wraps a list of items stamped out
 * by an ngFor. The container element contains an animation trigger that will later be set
 * to query for each of the inner items.
 *
 * ```html
 * <!-- list.component.html -->
 * <button (click)="toggle()">Show / Hide Items</button>
 * <hr />
 * <div [\@listAnimation]="items.length">
 *   <div *ngFor="let item of items">
 *     {{ item }}
 *   </div>
 * </div>
 * ```
 *
 * The component code for this looks as such:
 *
 * ```ts
 * import {trigger, transition, style, animate, query, stagger} from '\@angular/animations';
 * \@Component({
 *   templateUrl: 'list.component.html',
 *   animations: [
 *     trigger('listAnimation', [
 *        //...
 *     ])
 *   ]
 * })
 * class ListComponent {
 *   items = [];
 *
 *   showItems() {
 *     this.items = [0,1,2,3,4];
 *   }
 *
 *   hideItems() {
 *     this.items = [];
 *   }
 *
 *   toggle() {
 *     this.items.length ? this.hideItems() : this.showItems();
 *   }
 * }
 * ```
 *
 * And now for the animation trigger code:
 *
 * ```ts
 * trigger('listAnimation', [
 *   transition('* => *', [ // each time the binding value changes
 *     query(':leave', [
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 0 }))
 *       ])
 *     ]),
 *     query(':enter', [
 *       style({ opacity: 0 }),
 *       stagger(100, [
 *         animate('0.5s', style({ opacity: 1 }))
 *       ])
 *     ])
 *   ])
 * ])
 * ```
 *
 * Now each time the items are added/removed then either the opacity
 * fade-in animation will run or each removed item will be faded out.
 * When either of these animations occur then a stagger effect will be
 * applied after each item's animation is started.
 *
 * \@experimental Animation support is experimental.
 * @param {?} timings
 * @param {?} animation
 * @return {?}
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings, animation };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0VBLE1BQU0sQ0FBQyx1QkFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ1U5QixNQUFNLGtCQUFrQixJQUFZLEVBQUUsV0FBZ0M7SUFDcEUsTUFBTSxDQUFDLEVBQUMsSUFBSSxpQkFBK0IsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsQ0FBQztDQUM5RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStDRCxNQUFNLGtCQUNGLE9BQXdCLEVBQUUsU0FDZixJQUFJO0lBQ2pCLE1BQU0sQ0FBQyxFQUFDLElBQUksaUJBQStCLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQy9EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlDRCxNQUFNLGdCQUNGLEtBQTBCLEVBQUUsVUFBbUMsSUFBSTtJQUNyRSxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQzVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DRCxNQUFNLG1CQUFtQixLQUEwQixFQUFFLFVBQW1DLElBQUk7SUFFMUYsTUFBTSxDQUFDLEVBQUMsSUFBSSxrQkFBZ0MsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDRCxNQUFNLGdCQUNGLE1BQzJDO0lBQzdDLE1BQU0sQ0FBQyxFQUFDLElBQUksZUFBNkIsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztDQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrREQsTUFBTSxnQkFDRixJQUFZLEVBQUUsTUFBOEIsRUFDNUMsT0FBeUM7SUFDM0MsTUFBTSxDQUFDLEVBQUMsSUFBSSxlQUE2QixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStDRCxNQUFNLG9CQUFvQixLQUErQjtJQUN2RCxNQUFNLENBQUMsRUFBQyxJQUFJLG1CQUFpQyxFQUFFLEtBQUssRUFBQyxDQUFDO0NBQ3ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5TUQsTUFBTSxxQkFDRixlQUNzRSxFQUN0RSxLQUE4QyxFQUM5QyxVQUFtQyxJQUFJO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUksb0JBQWtDLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQ25HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxQ0QsTUFBTSxvQkFDRixLQUE4QyxFQUM5QyxVQUFtQyxJQUFJO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUksbUJBQWlDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUMzRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1HRCxNQUFNLHVCQUF1QixVQUFzQyxJQUFJO0lBRXJFLE1BQU0sQ0FBQyxFQUFDLElBQUksc0JBQW9DLEVBQUUsT0FBTyxFQUFDLENBQUM7Q0FDNUQ7Ozs7Ozs7Ozs7O0FBU0QsTUFBTSx1QkFDRixTQUFxQyxFQUNyQyxVQUFtQyxJQUFJO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUkscUJBQWtDLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDO0NBQ3JFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEZELE1BQU0sZ0JBQ0YsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxVQUF3QyxJQUFJO0lBQzlDLE1BQU0sQ0FBQyxFQUFDLElBQUksZ0JBQTZCLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUMsQ0FBQztDQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdGRCxNQUFNLGtCQUNGLE9BQXdCLEVBQ3hCLFNBQWtEO0lBQ3BELE1BQU0sQ0FBQyxFQUFDLElBQUksa0JBQStCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBQyxDQUFDO0NBQ2xFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IGludGVyZmFjZSDJtVN0eWxlRGF0YSB7IFtrZXk6IHN0cmluZ106IHN0cmluZ3xudW1iZXI7IH1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgY3JlYXRlZCBpbnRlcm5hbGx5XG4gKiB3aXRoaW4gdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIERTTC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgdHlwZSBBbmltYXRlVGltaW5ncyA9IHtcbiAgZHVyYXRpb246IG51bWJlcixcbiAgZGVsYXk6IG51bWJlcixcbiAgZWFzaW5nOiBzdHJpbmcgfCBudWxsXG59O1xuXG4vKipcbiAqIGBBbmltYXRpb25PcHRpb25zYCByZXByZXNlbnRzIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIGludG8gbW9zdCBhbmltYXRpb24gRFNMIG1ldGhvZHMuXG4gKiBXaGVuIG9wdGlvbnMgYXJlIHByb3ZpZGVkLCB0aGUgZGVsYXkgdmFsdWUgb2YgYW4gYW5pbWF0aW9uIGNhbiBiZSBjaGFuZ2VkIGFuZCBhbmltYXRpb24gaW5wdXRcbiAqIHBhcmFtZXRlcnMgY2FuIGJlIHBhc3NlZCBpbiB0byBjaGFuZ2Ugc3R5bGluZyBhbmQgdGltaW5nIGRhdGEgd2hlbiBhbiBhbmltYXRpb24gaXMgc3RhcnRlZC5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGFuaW1hdGlvbiBEU0wgZnVuY3Rpb25zIGFyZSBhYmxlIHRvIGFjY2VwdCBhbmltYXRpb24gb3B0aW9uIGRhdGE6XG4gKlxuICogLSB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9uKCl9XG4gKiAtIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZSgpfVxuICogLSB7QGxpbmsgZ3JvdXAgZ3JvdXAoKX1cbiAqIC0ge0BsaW5rIHF1ZXJ5IHF1ZXJ5KCl9XG4gKiAtIHtAbGluayBhbmltYXRpb24gYW5pbWF0aW9uKCl9XG4gKiAtIHtAbGluayB1c2VBbmltYXRpb24gdXNlQW5pbWF0aW9uKCl9XG4gKiAtIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkKCl9XG4gKlxuICogUHJvZ3JhbW1hdGljIGFuaW1hdGlvbnMgYnVpbHQgdXNpbmcge0BsaW5rIEFuaW1hdGlvbkJ1aWxkZXIgdGhlIEFuaW1hdGlvbkJ1aWxkZXIgc2VydmljZX0gYWxzb1xuICogbWFrZSB1c2Ugb2YgQW5pbWF0aW9uT3B0aW9ucy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvbk9wdGlvbnMge1xuICBkZWxheT86IG51bWJlcnxzdHJpbmc7XG4gIHBhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgY3JlYXRlZCBpbnRlcm5hbGx5XG4gKiB3aXRoaW4gdGhlIEFuZ3VsYXIgYW5pbWF0aW9uIERTTCB3aGVuIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkKCl9IGlzIHVzZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRlQ2hpbGRPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7IGR1cmF0aW9uPzogbnVtYmVyfHN0cmluZzsgfVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gVXNhZ2VzIG9mIHRoaXMgZW51bSBhcmUgY3JlYXRlZFxuICogZWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBEU0wgZnVuY3Rpb24gaXMgdXNlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQW5pbWF0aW9uTWV0YWRhdGFUeXBlIHtcbiAgU3RhdGUgPSAwLFxuICBUcmFuc2l0aW9uID0gMSxcbiAgU2VxdWVuY2UgPSAyLFxuICBHcm91cCA9IDMsXG4gIEFuaW1hdGUgPSA0LFxuICBLZXlmcmFtZXMgPSA1LFxuICBTdHlsZSA9IDYsXG4gIFRyaWdnZXIgPSA3LFxuICBSZWZlcmVuY2UgPSA4LFxuICBBbmltYXRlQ2hpbGQgPSA5LFxuICBBbmltYXRlUmVmID0gMTAsXG4gIFF1ZXJ5ID0gMTEsXG4gIFN0YWdnZXIgPSAxMlxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgY29uc3QgQVVUT19TVFlMRSA9ICcqJztcblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25NZXRhZGF0YSB7IHR5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZTsgfVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayB0cmlnZ2VyIHRyaWdnZXIgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiB7cGFyYW1zPzoge1tuYW1lOiBzdHJpbmddOiBhbnl9fXxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzdGF0ZSBzdGF0ZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YTtcbiAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX07XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbiBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGV4cHI6IHN0cmluZ3xcbiAgICAgICgoZnJvbVN0YXRlOiBzdHJpbmcsIHRvU3RhdGU6IHN0cmluZywgZWxlbWVudD86IGFueSxcbiAgICAgICAgcGFyYW1zPzoge1trZXk6IHN0cmluZ106IGFueX0pID0+IGJvb2xlYW4pO1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG4gIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc2VsZWN0b3I6IHN0cmluZztcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25RdWVyeU9wdGlvbnN8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsga2V5ZnJhbWVzIGtleWZyYW1lcyBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzdHlsZSBzdHlsZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHlsZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdHlsZXM6ICcqJ3x7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXxBcnJheTx7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfXwnKic+O1xuICBvZmZzZXQ6IG51bWJlcnxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBhbmltYXRlIGFuaW1hdGUgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyfEFuaW1hdGVUaW1pbmdzO1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGF8QW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YXxudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHVzZUFuaW1hdGlvbiB1c2VBbmltYXRpb24gYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uQW5pbWF0ZVJlZk1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblNlcXVlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIGdyb3VwIGdyb3VwIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHF1ZXJ5IHF1ZXJ5IGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0aW9uUXVlcnlPcHRpb25zIGV4dGVuZHMgQW5pbWF0aW9uT3B0aW9ucyB7XG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIFVzZWQgdG8gbGltaXQgdGhlIHRvdGFsIGFtb3VudCBvZiByZXN1bHRzIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBxdWVyeSBsaXN0LlxuICAgKlxuICAgKiBJZiBhIG5lZ2F0aXZlIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW4gdGhlIHF1ZXJpZWQgcmVzdWx0cyB3aWxsIGJlIGxpbWl0ZWQgZnJvbSB0aGVcbiAgICogZW5kIG9mIHRoZSBxdWVyeSBsaXN0IHRvd2FyZHMgdGhlIGJlZ2lubmluZyAoZS5nLiBpZiBgbGltaXQ6IC0zYCBpcyB1c2VkIHRoZW4gdGhlXG4gICAqIGZpbmFsIDMgKG9yIGxlc3MpIHF1ZXJpZWQgcmVzdWx0cyB3aWxsIGJlIHVzZWQgZm9yIHRoZSBhbmltYXRpb24pLlxuICAgKi9cbiAgbGltaXQ/OiBudW1iZXI7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIHN0YWdnZXIgc3RhZ2dlciBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4qIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhZ2dlck1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICB0aW1pbmdzOiBzdHJpbmd8bnVtYmVyO1xuICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhfEFuaW1hdGlvbk1ldGFkYXRhW107XG59XG5cbi8qKlxuICogYHRyaWdnZXJgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGVcbiAqIHtAbGluayBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyXG4gKiB1bmRlcnN0YW5kaW5nIG9mIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHRyaWdnZXJgIENyZWF0ZXMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgd2hpY2ggd2lsbCBhIGxpc3Qgb2Yge0BsaW5rIHN0YXRlIHN0YXRlfSBhbmRcbiAqIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259IGVudHJpZXMgdGhhdCB3aWxsIGJlIGV2YWx1YXRlZCB3aGVuIHRoZSBleHByZXNzaW9uXG4gKiBib3VuZCB0byB0aGUgdHJpZ2dlciBjaGFuZ2VzLlxuICpcbiAqIFRyaWdnZXJzIGFyZSByZWdpc3RlcmVkIHdpdGhpbiB0aGUgY29tcG9uZW50IGFubm90YXRpb24gZGF0YSB1bmRlciB0aGVcbiAqIHtAbGluayBDb21wb25lbnQjYW5pbWF0aW9ucyBhbmltYXRpb25zIHNlY3Rpb259LiBBbiBhbmltYXRpb24gdHJpZ2dlciBjYW4gYmUgcGxhY2VkIG9uIGFuIGVsZW1lbnRcbiAqIHdpdGhpbiBhIHRlbXBsYXRlIGJ5IHJlZmVyZW5jaW5nIHRoZSBuYW1lIG9mIHRoZSB0cmlnZ2VyIGZvbGxvd2VkIGJ5IHRoZSBleHByZXNzaW9uIHZhbHVlIHRoYXRcbiB0aGVcbiAqIHRyaWdnZXIgaXMgYm91bmQgdG8gKGluIHRoZSBmb3JtIG9mIGBbQHRyaWdnZXJOYW1lXT1cImV4cHJlc3Npb25cImAuXG4gKlxuICogQW5pbWF0aW9uIHRyaWdnZXIgYmluZGluZ3Mgc3RyaWdpZnkgdmFsdWVzIGFuZCB0aGVuIG1hdGNoIHRoZSBwcmV2aW91cyBhbmQgY3VycmVudCB2YWx1ZXMgYWdhaW5zdFxuICogYW55IGxpbmtlZCB0cmFuc2l0aW9ucy4gSWYgYSBib29sZWFuIHZhbHVlIGlzIHByb3ZpZGVkIGludG8gdGhlIHRyaWdnZXIgYmluZGluZyB0aGVuIGl0IHdpbGwgYm90aFxuICogYmUgcmVwcmVzZW50ZWQgYXMgYDFgIG9yIGB0cnVlYCBhbmQgYDBgIG9yIGBmYWxzZWAgZm9yIGEgdHJ1ZSBhbmQgZmFsc2UgYm9vbGVhbiB2YWx1ZXNcbiAqIHJlc3BlY3RpdmVseS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgdHJpZ2dlcmAgd2lsbCBjcmVhdGUgYW4gYW5pbWF0aW9uIHRyaWdnZXIgcmVmZXJlbmNlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBgbmFtZWAgdmFsdWUuIFRoZVxuICogcHJvdmlkZWQgYGFuaW1hdGlvbmAgdmFsdWUgaXMgZXhwZWN0ZWQgdG8gYmUgYW4gYXJyYXkgY29uc2lzdGluZyBvZiB7QGxpbmsgc3RhdGUgc3RhdGV9IGFuZFxuICoge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0gZGVjbGFyYXRpb25zLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJteUFuaW1hdGlvblRyaWdnZXJcIiwgW1xuICogICAgICAgc3RhdGUoLi4uKSxcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLiksXG4gKiAgICAgICB0cmFuc2l0aW9uKC4uLilcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwic29tZXRoaW5nXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IHdpbGwgbWFrZSB1c2Ugb2YgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIGFuaW1hdGlvblxuIHRyaWdnZXIgYnkgYmluZGluZyB0byBhbiBlbGVtZW50IHdpdGhpbiBpdHMgdGVtcGxhdGUgY29kZS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIHNvbWV3aGVyZSBpbnNpZGUgb2YgbXktY29tcG9uZW50LXRwbC5odG1sIC0tPlxuICogPGRpdiBbQG15QW5pbWF0aW9uVHJpZ2dlcl09XCJteVN0YXR1c0V4cFwiPi4uLjwvZGl2PlxuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIGFuIGlubGluZSBmdW5jdGlvblxuICogVGhlIGB0cmFuc2l0aW9uYCBhbmltYXRpb24gbWV0aG9kIGFsc28gc3VwcG9ydHMgcmVhZGluZyBhbiBpbmxpbmUgZnVuY3Rpb24gd2hpY2ggY2FuIGRlY2lkZVxuICogaWYgaXRzIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHNob3VsZCBiZSBydW4uXG4gKlxuICogYGBgXG4gKiAvLyB0aGlzIG1ldGhvZCB3aWxsIGJlIHJ1biBlYWNoIHRpbWUgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgXG4gKiAvLyB0cmlnZ2VyIHZhbHVlIGNoYW5nZXMuLi5cbiAqIGZ1bmN0aW9uIG15SW5saW5lTWF0Y2hlckZuKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ6IGFueSwgcGFyYW1zOiB7W2tleTpcbiBzdHJpbmddOiBhbnl9KTogYm9vbGVhbiB7XG4gKiAgIC8vIG5vdGljZSB0aGF0IGBlbGVtZW50YCBhbmQgYHBhcmFtc2AgYXJlIGFsc28gYXZhaWxhYmxlIGhlcmVcbiAqICAgcmV0dXJuIHRvU3RhdGUgPT0gJ3llcy1wbGVhc2UtYW5pbWF0ZSc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteS1jb21wb25lbnQtdHBsLmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbXlBbmltYXRpb25UcmlnZ2VyJywgW1xuICogICAgICAgdHJhbnNpdGlvbihteUlubGluZU1hdGNoZXJGbiwgW1xuICogICAgICAgICAvLyB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlIGNvZGVcbiAqICAgICAgIF0pLFxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIG15U3RhdHVzRXhwID0gXCJ5ZXMtcGxlYXNlLWFuaW1hdGVcIjtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoZSBpbmxpbmUgbWV0aG9kIHdpbGwgYmUgcnVuIGVhY2ggdGltZSB0aGUgdHJpZ2dlclxuICogdmFsdWUgY2hhbmdlc1xuICpcbiAqICMjIERpc2FibGUgQW5pbWF0aW9uc1xuICogQSBzcGVjaWFsIGFuaW1hdGlvbiBjb250cm9sIGJpbmRpbmcgY2FsbGVkIGBALmRpc2FibGVkYCBjYW4gYmUgcGxhY2VkIG9uIGFuIGVsZW1lbnQgd2hpY2ggd2lsbFxuIHRoZW4gZGlzYWJsZSBhbmltYXRpb25zIGZvciBhbnkgaW5uZXIgYW5pbWF0aW9uIHRyaWdnZXJzIHNpdHVhdGVkIHdpdGhpbiB0aGUgZWxlbWVudCBhcyB3ZWxsIGFzXG4gYW55IGFuaW1hdGlvbnMgb24gdGhlIGVsZW1lbnQgaXRzZWxmLlxuICpcbiAqIFdoZW4gdHJ1ZSwgdGhlIGBALmRpc2FibGVkYCBiaW5kaW5nIHdpbGwgcHJldmVudCBhbGwgYW5pbWF0aW9ucyBmcm9tIHJlbmRlcmluZy4gVGhlIGV4YW1wbGVcbiBiZWxvdyBzaG93cyBob3cgdG8gdXNlIHRoaXMgZmVhdHVyZTpcbiAqXG4gKiBgYGB0c1xuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtALmRpc2FibGVkXT1cImlzRGlzYWJsZWRcIj5cbiAqICAgICAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoXCJjaGlsZEFuaW1hdGlvblwiLCBbXG4gKiAgICAgICAvLyAuLi5cbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBpc0Rpc2FibGVkID0gdHJ1ZTtcbiAqICAgZXhwID0gJy4uLic7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgYEBjaGlsZEFuaW1hdGlvbmAgdHJpZ2dlciB3aWxsIG5vdCBhbmltYXRlIGJlY2F1c2UgYEAuZGlzYWJsZWRgIHByZXZlbnRzIGl0IGZyb20gaGFwcGVuaW5nXG4gKHdoZW4gdHJ1ZSkuXG4gKlxuICogTm90ZSB0aGF0IGBALmRpc2FibGVkYCB3aWxsIG9ubHkgZGlzYWJsZSBhbGwgYW5pbWF0aW9ucyAodGhpcyBtZWFucyBhbnkgYW5pbWF0aW9ucyBydW5uaW5nIG9uXG4gKiB0aGUgc2FtZSBlbGVtZW50IHdpbGwgYWxzbyBiZSBkaXNhYmxlZCkuXG4gKlxuICogIyMjIERpc2FibGluZyBBbmltYXRpb25zIEFwcGxpY2F0aW9uLXdpZGVcbiAqIFdoZW4gYW4gYXJlYSBvZiB0aGUgdGVtcGxhdGUgaXMgc2V0IHRvIGhhdmUgYW5pbWF0aW9ucyBkaXNhYmxlZCwgKiphbGwqKiBpbm5lciBjb21wb25lbnRzIHdpbGxcbiBhbHNvIGhhdmUgdGhlaXIgYW5pbWF0aW9ucyBkaXNhYmxlZCBhcyB3ZWxsLiBUaGlzIG1lYW5zIHRoYXQgYWxsIGFuaW1hdGlvbnMgZm9yIGFuIGFuZ3VsYXJcbiBhcHBsaWNhdGlvbiBjYW4gYmUgZGlzYWJsZWQgYnkgcGxhY2luZyBhIGhvc3QgYmluZGluZyBzZXQgb24gYEAuZGlzYWJsZWRgIG9uIHRoZSB0b3Btb3N0IEFuZ3VsYXJcbiBjb21wb25lbnQuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7Q29tcG9uZW50LCBIb3N0QmluZGluZ30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwLWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnYXBwLmNvbXBvbmVudC5odG1sJyxcbiAqIH0pXG4gKiBjbGFzcyBBcHBDb21wb25lbnQge1xuICogICBASG9zdEJpbmRpbmcoJ0AuZGlzYWJsZWQnKVxuICogICBwdWJsaWMgYW5pbWF0aW9uc0Rpc2FibGVkID0gdHJ1ZTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBXaGF0IGFib3V0IGFuaW1hdGlvbnMgdGhhdCB1cyBgcXVlcnkoKWAgYW5kIGBhbmltYXRlQ2hpbGQoKWA/XG4gKiBEZXNwaXRlIGlubmVyIGFuaW1hdGlvbnMgYmVpbmcgZGlzYWJsZWQsIGEgcGFyZW50IGFuaW1hdGlvbiBjYW4ge0BsaW5rIHF1ZXJ5IHF1ZXJ5fSBmb3IgaW5uZXJcbiBlbGVtZW50cyBsb2NhdGVkIGluIGRpc2FibGVkIGFyZWFzIG9mIHRoZSB0ZW1wbGF0ZSBhbmQgc3RpbGwgYW5pbWF0ZSB0aGVtIGFzIGl0IHNlZXMgZml0LiBUaGlzIGlzXG4gYWxzbyB0aGUgY2FzZSBmb3Igd2hlbiBhIHN1YiBhbmltYXRpb24gaXMgcXVlcmllZCBieSBhIHBhcmVudCBhbmQgdGhlbiBsYXRlciBhbmltYXRlZCB1c2luZyB7QGxpbmtcbiBhbmltYXRlQ2hpbGQgYW5pbWF0ZUNoaWxkfS5cblxuICogIyMjIERldGVjdGluZyB3aGVuIGFuIGFuaW1hdGlvbiBpcyBkaXNhYmxlZFxuICogSWYgYSByZWdpb24gb2YgdGhlIERPTSAob3IgdGhlIGVudGlyZSBhcHBsaWNhdGlvbikgaGFzIGl0cyBhbmltYXRpb25zIGRpc2FibGVkLCB0aGVuIGFuaW1hdGlvblxuICogdHJpZ2dlciBjYWxsYmFja3Mgd2lsbCBzdGlsbCBmaXJlIGp1c3QgYXMgbm9ybWFsIChvbmx5IGZvciB6ZXJvIHNlY29uZHMpLlxuICpcbiAqIFdoZW4gYSB0cmlnZ2VyIGNhbGxiYWNrIGZpcmVzIGl0IHdpbGwgcHJvdmlkZSBhbiBpbnN0YW5jZSBvZiBhbiB7QGxpbmsgQW5pbWF0aW9uRXZlbnR9LiBJZlxuIGFuaW1hdGlvbnNcbiAqIGFyZSBkaXNhYmxlZCB0aGVuIHRoZSBgLmRpc2FibGVkYCBmbGFnIG9uIHRoZSBldmVudCB3aWxsIGJlIHRydWUuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyKG5hbWU6IHN0cmluZywgZGVmaW5pdGlvbnM6IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25UcmlnZ2VyTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmlnZ2VyLCBuYW1lLCBkZWZpbml0aW9ucywgb3B0aW9uczoge319O1xufVxuXG4vKipcbiAqIGBhbmltYXRlYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBhbmltYXRlYCBzcGVjaWZpZXMgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCB3aWxsIGFwcGx5IHRoZSBwcm92aWRlZCBgc3R5bGVzYCBkYXRhIGZvciBhIGdpdmVuXG4gKiBhbW91bnQgb2YgdGltZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgYHRpbWluZ2AgZXhwcmVzc2lvbiB2YWx1ZS4gQ2FsbHMgdG8gYGFuaW1hdGVgIGFyZSBleHBlY3RlZFxuICogdG8gYmUgdXNlZCB3aXRoaW4ge0BsaW5rIHNlcXVlbmNlIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZX0sIHtAbGluayBncm91cCBncm91cH0sIG9yIHtAbGlua1xuICogdHJhbnNpdGlvbiB0cmFuc2l0aW9ufS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBUaGUgYGFuaW1hdGVgIGZ1bmN0aW9uIGFjY2VwdHMgdHdvIGlucHV0IHBhcmFtZXRlcnM6IGB0aW1pbmdgIGFuZCBgc3R5bGVzYDpcbiAqXG4gKiAtIGB0aW1pbmdgIGlzIGEgc3RyaW5nIGJhc2VkIHZhbHVlIHRoYXQgY2FuIGJlIGEgY29tYmluYXRpb24gb2YgYSBkdXJhdGlvbiB3aXRoIG9wdGlvbmFsIGRlbGF5XG4gKiBhbmQgZWFzaW5nIHZhbHVlcy4gVGhlIGZvcm1hdCBmb3IgdGhlIGV4cHJlc3Npb24gYnJlYWtzIGRvd24gdG8gYGR1cmF0aW9uIGRlbGF5IGVhc2luZ2BcbiAqICh0aGVyZWZvcmUgYSB2YWx1ZSBzdWNoIGFzIGAxcyAxMDBtcyBlYXNlLW91dGAgd2lsbCBiZSBwYXJzZSBpdHNlbGYgaW50byBgZHVyYXRpb249MTAwMCxcbiAqIGRlbGF5PTEwMCwgZWFzaW5nPWVhc2Utb3V0YC4gSWYgYSBudW1lcmljIHZhbHVlIGlzIHByb3ZpZGVkIHRoZW4gdGhhdCB3aWxsIGJlIHVzZWQgYXMgdGhlXG4gKiBgZHVyYXRpb25gIHZhbHVlIGluIG1pbGxpc2Vjb25kIGZvcm0uXG4gKiAtIGBzdHlsZXNgIGlzIHRoZSBzdHlsZSBpbnB1dCBkYXRhIHdoaWNoIGNhbiBlaXRoZXIgYmUgYSBjYWxsIHRvIHtAbGluayBzdHlsZSBzdHlsZX0gb3Ige0BsaW5rXG4gKiBrZXlmcmFtZXMga2V5ZnJhbWVzfS4gSWYgbGVmdCBlbXB0eSB0aGVuIHRoZSBzdHlsZXMgZnJvbSB0aGUgZGVzdGluYXRpb24gc3RhdGUgd2lsbCBiZSBjb2xsZWN0ZWRcbiAqIGFuZCB1c2VkICh0aGlzIGlzIHVzZWZ1bCB3aGVuIGRlc2NyaWJpbmcgYW4gYW5pbWF0aW9uIHN0ZXAgdGhhdCB3aWxsIGNvbXBsZXRlIGFuIGFuaW1hdGlvbiBieVxuICoge0BsaW5rIHRyYW5zaXRpb24jdGhlLWZpbmFsLWFuaW1hdGUtY2FsbCBhbmltYXRpbmcgdG8gdGhlIGZpbmFsIHN0YXRlfSkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdmFyaW91cyBmdW5jdGlvbnMgZm9yIHNwZWNpZnlpbmcgdGltaW5nIGRhdGFcbiAqIGFuaW1hdGUoNTAwLCBzdHlsZSguLi4pKVxuICogYW5pbWF0ZShcIjFzXCIsIHN0eWxlKC4uLikpXG4gKiBhbmltYXRlKFwiMTAwbXMgMC41c1wiLCBzdHlsZSguLi4pKVxuICogYW5pbWF0ZShcIjVzIGVhc2VcIiwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCI1cyAxMG1zIGN1YmljLWJlemllciguMTcsLjY3LC44OCwuMSlcIiwgc3R5bGUoLi4uKSlcbiAqXG4gKiAvLyBlaXRoZXIgc3R5bGUoKSBvZiBrZXlmcmFtZXMoKSBjYW4gYmUgdXNlZFxuICogYW5pbWF0ZSg1MDAsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqIGFuaW1hdGUoNTAwLCBrZXlmcmFtZXMoW1xuICogICBzdHlsZSh7IGJhY2tncm91bmQ6IFwiYmx1ZVwiIH0pKSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcInJlZFwiIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0ZShcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIsIHN0eWxlczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB8IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEgfFxuICAgICAgICBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGUsIHN0eWxlcywgdGltaW5nc307XG59XG5cbi8qKlxuICogYGdyb3VwYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBncm91cGAgc3BlY2lmaWVzIGEgbGlzdCBvZiBhbmltYXRpb24gc3RlcHMgdGhhdCBhcmUgYWxsIHJ1biBpbiBwYXJhbGxlbC4gR3JvdXBlZCBhbmltYXRpb25zIGFyZVxuICogdXNlZnVsIHdoZW4gYSBzZXJpZXMgb2Ygc3R5bGVzIG11c3QgYmUgYW5pbWF0ZWQvY2xvc2VkIG9mZiBhdCBkaWZmZXJlbnQgc3RhcnRpbmcvZW5kaW5nIHRpbWVzLlxuICpcbiAqIFRoZSBgZ3JvdXBgIGZ1bmN0aW9uIGNhbiBlaXRoZXIgYmUgdXNlZCB3aXRoaW4gYSB7QGxpbmsgc2VxdWVuY2Ugc2VxdWVuY2V9IG9yIGEge0BsaW5rIHRyYW5zaXRpb25cbiAqIHRyYW5zaXRpb259IGFuZCBpdCB3aWxsIG9ubHkgY29udGludWUgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb24gb25jZSBhbGwgb2YgdGhlIGlubmVyIGFuaW1hdGlvblxuICogc3RlcHMgaGF2ZSBjb21wbGV0ZWQuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogVGhlIGBzdGVwc2AgZGF0YSB0aGF0IGlzIHBhc3NlZCBpbnRvIHRoZSBgZ3JvdXBgIGFuaW1hdGlvbiBmdW5jdGlvbiBjYW4gZWl0aGVyIGNvbnNpc3Qgb2Yge0BsaW5rXG4gKiBzdHlsZSBzdHlsZX0gb3Ige0BsaW5rIGFuaW1hdGUgYW5pbWF0ZX0gZnVuY3Rpb24gY2FsbHMuIEVhY2ggY2FsbCB0byBgc3R5bGUoKWAgb3IgYGFuaW1hdGUoKWBcbiAqIHdpdGhpbiBhIGdyb3VwIHdpbGwgYmUgZXhlY3V0ZWQgaW5zdGFudGx5ICh1c2Uge0BsaW5rIGtleWZyYW1lcyBrZXlmcmFtZXN9IG9yIGEge0BsaW5rXG4gKiBhbmltYXRlI3VzYWdlIGFuaW1hdGUoKSB3aXRoIGEgZGVsYXkgdmFsdWV9IHRvIG9mZnNldCBzdHlsZXMgdG8gYmUgYXBwbGllZCBhdCBhIGxhdGVyIHRpbWUpLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGdyb3VwKFtcbiAqICAgYW5pbWF0ZShcIjFzXCIsIHsgYmFja2dyb3VuZDogXCJibGFja1wiIH0pKVxuICogICBhbmltYXRlKFwiMnNcIiwgeyBjb2xvcjogXCJ3aGl0ZVwiIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXAoXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkdyb3VwTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5Hcm91cCwgc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBzZXF1ZW5jZWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgc2VxdWVuY2VgIFNwZWNpZmllcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRoYXQgYXJlIHJ1biBvbmUgYnkgb25lLiAoYHNlcXVlbmNlYCBpcyB1c2VkIGJ5XG4gKiBkZWZhdWx0IHdoZW4gYW4gYXJyYXkgaXMgcGFzc2VkIGFzIGFuaW1hdGlvbiBkYXRhIGludG8ge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0uKVxuICpcbiAqIFRoZSBgc2VxdWVuY2VgIGZ1bmN0aW9uIGNhbiBlaXRoZXIgYmUgdXNlZCB3aXRoaW4gYSB7QGxpbmsgZ3JvdXAgZ3JvdXB9IG9yIGEge0BsaW5rIHRyYW5zaXRpb25cbiAqIHRyYW5zaXRpb259IGFuZCBpdCB3aWxsIG9ubHkgY29udGludWUgdG8gdGhlIG5leHQgaW5zdHJ1Y3Rpb24gb25jZSBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb25cbiAqIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICpcbiAqIFRvIHBlcmZvcm0gYW5pbWF0aW9uIHN0eWxpbmcgaW4gcGFyYWxsZWwgd2l0aCBvdGhlciBhbmltYXRpb24gc3RlcHMgdGhlbiBoYXZlIGEgbG9vayBhdCB0aGVcbiAqIHtAbGluayBncm91cCBncm91cH0gYW5pbWF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIFRoZSBgc3RlcHNgIGRhdGEgdGhhdCBpcyBwYXNzZWQgaW50byB0aGUgYHNlcXVlbmNlYCBhbmltYXRpb24gZnVuY3Rpb24gY2FuIGVpdGhlciBjb25zaXN0IG9mXG4gKiB7QGxpbmsgc3R5bGUgc3R5bGV9IG9yIHtAbGluayBhbmltYXRlIGFuaW1hdGV9IGZ1bmN0aW9uIGNhbGxzLiBBIGNhbGwgdG8gYHN0eWxlKClgIHdpbGwgYXBwbHkgdGhlXG4gKiBwcm92aWRlZCBzdHlsaW5nIGRhdGEgaW1tZWRpYXRlbHkgd2hpbGUgYSBjYWxsIHRvIGBhbmltYXRlKClgIHdpbGwgYXBwbHkgaXRzIHN0eWxpbmcgZGF0YSBvdmVyIGFcbiAqIGdpdmVuIHRpbWUgZGVwZW5kaW5nIG9uIGl0cyB0aW1pbmcgZGF0YS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBzZXF1ZW5jZShbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCB7IG9wYWNpdHk6IDEgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXF1ZW5jZShzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXSwgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTpcbiAgICBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU2VxdWVuY2UsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgc3R5bGVgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHN0eWxlYCBkZWNsYXJlcyBhIGtleS92YWx1ZSBvYmplY3QgY29udGFpbmluZyBDU1MgcHJvcGVydGllcy9zdHlsZXMgdGhhdCBjYW4gdGhlbiBiZSB1c2VkIGZvclxuICoge0BsaW5rIHN0YXRlIGFuaW1hdGlvbiBzdGF0ZXN9LCB3aXRoaW4gYW4ge0BsaW5rIHNlcXVlbmNlIGFuaW1hdGlvbiBzZXF1ZW5jZX0sIG9yIGFzIHN0eWxpbmcgZGF0YVxuICogZm9yIGJvdGgge0BsaW5rIGFuaW1hdGUgYW5pbWF0ZX0gYW5kIHtAbGluayBrZXlmcmFtZXMga2V5ZnJhbWVzfS5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBgc3R5bGVgIHRha2VzIGluIGEga2V5L3ZhbHVlIHN0cmluZyBtYXAgYXMgZGF0YSBhbmQgZXhwZWN0cyBvbmUgb3IgbW9yZSBDU1MgcHJvcGVydHkvdmFsdWUgcGFpcnNcbiAqIHRvIGJlIGRlZmluZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gc3RyaW5nIHZhbHVlcyBhcmUgdXNlZCBmb3IgY3NzIHByb3BlcnRpZXNcbiAqIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiwgY29sb3I6IFwiYmx1ZVwiIH0pXG4gKlxuICogLy8gbnVtZXJpY2FsIChwaXhlbCkgdmFsdWVzIGFyZSBhbHNvIHN1cHBvcnRlZFxuICogc3R5bGUoeyB3aWR0aDogMTAwLCBoZWlnaHQ6IDAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyMgQXV0by1zdHlsZXMgKHVzaW5nIGAqYClcbiAqXG4gKiBXaGVuIGFuIGFzdGVyaXggKGAqYCkgY2hhcmFjdGVyIGlzIHVzZWQgYXMgYSB2YWx1ZSB0aGVuIGl0IHdpbGwgYmUgZGV0ZWN0ZWQgZnJvbSB0aGUgZWxlbWVudFxuICogYmVpbmcgYW5pbWF0ZWQgYW5kIGFwcGxpZWQgYXMgYW5pbWF0aW9uIGRhdGEgd2hlbiB0aGUgYW5pbWF0aW9uIHN0YXJ0cy5cbiAqXG4gKiBUaGlzIGZlYXR1cmUgcHJvdmVzIHVzZWZ1bCBmb3IgYSBzdGF0ZSBkZXBlbmRpbmcgb24gbGF5b3V0IGFuZC9vciBlbnZpcm9ubWVudCBmYWN0b3JzOyBpbiBzdWNoXG4gKiBjYXNlcyB0aGUgc3R5bGVzIGFyZSBjYWxjdWxhdGVkIGp1c3QgYmVmb3JlIHRoZSBhbmltYXRpb24gc3RhcnRzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHRoZSBzdGVwcyBiZWxvdyB3aWxsIGFuaW1hdGUgZnJvbSAwIHRvIHRoZVxuICogLy8gYWN0dWFsIGhlaWdodCBvZiB0aGUgZWxlbWVudFxuICogc3R5bGUoeyBoZWlnaHQ6IDAgfSksXG4gKiBhbmltYXRlKFwiMXNcIiwgc3R5bGUoeyBoZWlnaHQ6IFwiKlwiIH0pKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZShcbiAgICB0b2tlbnM6ICcqJyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9IHxcbiAgICBBcnJheTwnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn0+KTogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0eWxlLCBzdHlsZXM6IHRva2Vucywgb2Zmc2V0OiBudWxsfTtcbn1cblxuLyoqXG4gKiBgc3RhdGVgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHN0YXRlYCBkZWNsYXJlcyBhbiBhbmltYXRpb24gc3RhdGUgd2l0aGluIHRoZSBnaXZlbiB0cmlnZ2VyLiBXaGVuIGEgc3RhdGUgaXMgYWN0aXZlIHdpdGhpbiBhXG4gKiBjb21wb25lbnQgdGhlbiBpdHMgYXNzb2NpYXRlZCBzdHlsZXMgd2lsbCBwZXJzaXN0IG9uIHRoZSBlbGVtZW50IHRoYXQgdGhlIHRyaWdnZXIgaXMgYXR0YWNoZWQgdG9cbiAqIChldmVuIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRzKS5cbiAqXG4gKiBUbyBhbmltYXRlIGJldHdlZW4gc3RhdGVzLCBoYXZlIGEgbG9vayBhdCB0aGUgYW5pbWF0aW9uIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259IERTTFxuICogZnVuY3Rpb24uIFRvIHJlZ2lzdGVyIHN0YXRlcyB0byBhbiBhbmltYXRpb24gdHJpZ2dlciBwbGVhc2UgaGF2ZSBhIGxvb2sgYXQgdGhlIHtAbGluayB0cmlnZ2VyXG4gKiB0cmlnZ2VyfSBmdW5jdGlvbi5cbiAqXG4gKiAjIyMjIFRoZSBgdm9pZGAgc3RhdGVcbiAqXG4gKiBUaGUgYHZvaWRgIHN0YXRlIHZhbHVlIGlzIGEgcmVzZXJ2ZWQgd29yZCB0aGF0IGFuZ3VsYXIgdXNlcyB0byBkZXRlcm1pbmUgd2hlbiB0aGUgZWxlbWVudCBpcyBub3RcbiAqIGFwYXJ0IG9mIHRoZSBhcHBsaWNhdGlvbiBhbnltb3JlIChlLmcuIHdoZW4gYW4gYG5nSWZgIGV2YWx1YXRlcyB0byBmYWxzZSB0aGVuIHRoZSBzdGF0ZSBvZiB0aGVcbiAqIGFzc29jaWF0ZWQgZWxlbWVudCBpcyB2b2lkKS5cbiAqXG4gKiAjIyMjIFRoZSBgKmAgKGRlZmF1bHQpIHN0YXRlXG4gKlxuICogVGhlIGAqYCBzdGF0ZSAod2hlbiBzdHlsZWQpIGlzIGEgZmFsbGJhY2sgc3RhdGUgdGhhdCB3aWxsIGJlIHVzZWQgaWYgdGhlIHN0YXRlIHRoYXQgaXMgYmVpbmdcbiAqIGFuaW1hdGVkIGlzIG5vdCBkZWNsYXJlZCB3aXRoaW4gdGhlIHRyaWdnZXIuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogYHN0YXRlYCB3aWxsIGRlY2xhcmUgYW4gYW5pbWF0aW9uIHN0YXRlIHdpdGggaXRzIGFzc29jaWF0ZWQgc3R5bGVzXG4gKiB3aXRoaW4gdGhlIGdpdmVuIHRyaWdnZXIuXG4gKlxuICogLSBgc3RhdGVOYW1lRXhwcmAgY2FuIGJlIG9uZSBvciBtb3JlIHN0YXRlIG5hbWVzIHNlcGFyYXRlZCBieSBjb21tYXMuXG4gKiAtIGBzdHlsZXNgIHJlZmVycyB0byB0aGUge0BsaW5rIHN0eWxlIHN0eWxpbmcgZGF0YX0gdGhhdCB3aWxsIGJlIHBlcnNpc3RlZCBvbiB0aGUgZWxlbWVudCBvbmNlXG4gKiB0aGUgc3RhdGUgaGFzIGJlZW4gcmVhY2hlZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBcInZvaWRcIiBpcyBhIHJlc2VydmVkIG5hbWUgZm9yIGEgc3RhdGUgYW5kIGlzIHVzZWQgdG8gcmVwcmVzZW50XG4gKiAvLyB0aGUgc3RhdGUgaW4gd2hpY2ggYW4gZWxlbWVudCBpcyBkZXRhY2hlZCBmcm9tIGZyb20gdGhlIGFwcGxpY2F0aW9uLlxuICogc3RhdGUoXCJ2b2lkXCIsIHN0eWxlKHsgaGVpZ2h0OiAwIH0pKVxuICpcbiAqIC8vIHVzZXItZGVmaW5lZCBzdGF0ZXNcbiAqIHN0YXRlKFwiY2xvc2VkXCIsIHN0eWxlKHsgaGVpZ2h0OiAwIH0pKVxuICogc3RhdGUoXCJvcGVuLCB2aXNpYmxlXCIsIHN0eWxlKHsgaGVpZ2h0OiBcIipcIiB9KSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhdGUoXG4gICAgbmFtZTogc3RyaW5nLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEsXG4gICAgb3B0aW9ucz86IHtwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogYW55fX0pOiBBbmltYXRpb25TdGF0ZU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuU3RhdGUsIG5hbWUsIHN0eWxlcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYGtleWZyYW1lc2AgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBga2V5ZnJhbWVzYCBzcGVjaWZpZXMgYSBjb2xsZWN0aW9uIG9mIHtAbGluayBzdHlsZSBzdHlsZX0gZW50cmllcyBlYWNoIG9wdGlvbmFsbHkgY2hhcmFjdGVyaXplZFxuICogYnkgYW4gYG9mZnNldGAgdmFsdWUuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogVGhlIGBrZXlmcmFtZXNgIGFuaW1hdGlvbiBmdW5jdGlvbiBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGFsb25nc2lkZSB0aGUge0BsaW5rIGFuaW1hdGUgYW5pbWF0ZX1cbiAqIGFuaW1hdGlvbiBmdW5jdGlvbi4gSW5zdGVhZCBvZiBhcHBseWluZyBhbmltYXRpb25zIGZyb20gd2hlcmUgdGhleSBhcmUgY3VycmVudGx5IHRvIHRoZWlyXG4gKiBkZXN0aW5hdGlvbiwga2V5ZnJhbWVzIGNhbiBkZXNjcmliZSBob3cgZWFjaCBzdHlsZSBlbnRyeSBpcyBhcHBsaWVkIGFuZCBhdCB3aGF0IHBvaW50IHdpdGhpbiB0aGVcbiAqIGFuaW1hdGlvbiBhcmMgKG11Y2ggbGlrZSBDU1MgS2V5ZnJhbWUgQW5pbWF0aW9ucyBkbykuXG4gKlxuICogRm9yIGVhY2ggYHN0eWxlKClgIGVudHJ5IGFuIGBvZmZzZXRgIHZhbHVlIGNhbiBiZSBzZXQuIERvaW5nIHNvIGFsbG93cyB0byBzcGVjaWZ5IGF0IHdoYXRcbiAqIHBlcmNlbnRhZ2Ugb2YgdGhlIGFuaW1hdGUgdGltZSB0aGUgc3R5bGVzIHdpbGwgYmUgYXBwbGllZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGUgcHJvdmlkZWQgb2Zmc2V0IHZhbHVlcyBkZXNjcmliZSB3aGVuIGVhY2ggYmFja2dyb3VuZENvbG9yIHZhbHVlIGlzIGFwcGxpZWQuXG4gKiBhbmltYXRlKFwiNXNcIiwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIsIG9mZnNldDogMCB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiLCBvZmZzZXQ6IDAuMiB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIsIG9mZnNldDogMC4zIH0pLFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiLCBvZmZzZXQ6IDEgfSlcbiAqIF0pKVxuICogYGBgXG4gKlxuICogQWx0ZXJuYXRpdmVseSwgaWYgdGhlcmUgYXJlIG5vIGBvZmZzZXRgIHZhbHVlcyB1c2VkIHdpdGhpbiB0aGUgc3R5bGUgZW50cmllcyB0aGVuIHRoZSBvZmZzZXRzXG4gKiB3aWxsIGJlIGNhbGN1bGF0ZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBhbmltYXRlKFwiNXNcIiwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwicmVkXCIgfSkgLy8gb2Zmc2V0ID0gMFxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibHVlXCIgfSkgLy8gb2Zmc2V0ID0gMC4zM1xuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJvcmFuZ2VcIiB9KSAvLyBvZmZzZXQgPSAwLjY2XG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCIgfSkgLy8gb2Zmc2V0ID0gMVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGtleWZyYW1lcyhzdGVwczogQW5pbWF0aW9uU3R5bGVNZXRhZGF0YVtdKTogQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLktleWZyYW1lcywgc3RlcHN9O1xufVxuXG4vKipcbiAqIGB0cmFuc2l0aW9uYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGB0cmFuc2l0aW9uYCBkZWNsYXJlcyB0aGUge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlIG9mIGFuaW1hdGlvbiBzdGVwc30gdGhhdCB3aWxsIGJlIHJ1biB3aGVuIHRoZVxuICogcHJvdmlkZWQgYHN0YXRlQ2hhbmdlRXhwcmAgdmFsdWUgaXMgc2F0aXNmaWVkLiBUaGUgYHN0YXRlQ2hhbmdlRXhwcmAgY29uc2lzdHMgb2YgYSBgc3RhdGUxID0+XG4gKiBzdGF0ZTJgIHdoaWNoIGNvbnNpc3RzIG9mIHR3byBrbm93biBzdGF0ZXMgKHVzZSBhbiBhc3Rlcml4IChgKmApIHRvIHJlZmVyIHRvIGEgZHluYW1pYyBzdGFydGluZ1xuICogYW5kL29yIGVuZGluZyBzdGF0ZSkuXG4gKlxuICogQSBmdW5jdGlvbiBjYW4gYWxzbyBiZSBwcm92aWRlZCBhcyB0aGUgYHN0YXRlQ2hhbmdlRXhwcmAgYXJndW1lbnQgZm9yIGEgdHJhbnNpdGlvbiBhbmQgdGhpc1xuICogZnVuY3Rpb24gd2lsbCBiZSBleGVjdXRlZCBlYWNoIHRpbWUgYSBzdGF0ZSBjaGFuZ2Ugb2NjdXJzLiBJZiB0aGUgdmFsdWUgcmV0dXJuZWQgd2l0aGluIHRoZVxuICogZnVuY3Rpb24gaXMgdHJ1ZSB0aGVuIHRoZSBhc3NvY2lhdGVkIGFuaW1hdGlvbiB3aWxsIGJlIHJ1bi5cbiAqXG4gKiBBbmltYXRpb24gdHJhbnNpdGlvbnMgYXJlIHBsYWNlZCB3aXRoaW4gYW4ge0BsaW5rIHRyaWdnZXIgYW5pbWF0aW9uIHRyaWdnZXJ9LiBGb3IgYW4gdHJhbnNpdGlvblxuICogdG8gYW5pbWF0ZSB0byBhIHN0YXRlIHZhbHVlIGFuZCBwZXJzaXN0IGl0cyBzdHlsZXMgdGhlbiBvbmUgb3IgbW9yZSB7QGxpbmsgc3RhdGUgYW5pbWF0aW9uXG4gKiBzdGF0ZXN9IGlzIGV4cGVjdGVkIHRvIGJlIGRlZmluZWQuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogQW4gYW5pbWF0aW9uIHRyYW5zaXRpb24gaXMga2lja2VkIG9mZiB0aGUgYHN0YXRlQ2hhbmdlRXhwcmAgcHJlZGljYXRlIGV2YWx1YXRlcyB0byB0cnVlIGJhc2VkIG9uXG4gKiB3aGF0IHRoZSBwcmV2aW91cyBzdGF0ZSBpcyBhbmQgd2hhdCB0aGUgY3VycmVudCBzdGF0ZSBoYXMgYmVjb21lLiBJbiBvdGhlciB3b3JkcywgaWYgYSB0cmFuc2l0aW9uXG4gKiBpcyBkZWZpbmVkIHRoYXQgbWF0Y2hlcyB0aGUgb2xkL2N1cnJlbnQgc3RhdGUgY3JpdGVyaWEgdGhlbiB0aGUgYXNzb2NpYXRlZCBhbmltYXRpb24gd2lsbCBiZVxuICogdHJpZ2dlcmVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIGFsbCB0cmFuc2l0aW9uL3N0YXRlIGNoYW5nZXMgYXJlIGRlZmluZWQgd2l0aGluIGFuIGFuaW1hdGlvbiB0cmlnZ2VyXG4gKiB0cmlnZ2VyKFwibXlBbmltYXRpb25UcmlnZ2VyXCIsIFtcbiAqICAgLy8gaWYgYSBzdGF0ZSBpcyBkZWZpbmVkIHRoZW4gaXRzIHN0eWxlcyB3aWxsIGJlIHBlcnNpc3RlZCB3aGVuIHRoZVxuICogICAvLyBhbmltYXRpb24gaGFzIGZ1bGx5IGNvbXBsZXRlZCBpdHNlbGZcbiAqICAgc3RhdGUoXCJvblwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JlZW5cIiB9KSksXG4gKiAgIHN0YXRlKFwib2ZmXCIsIHN0eWxlKHsgYmFja2dyb3VuZDogXCJncmV5XCIgfSkpLFxuICpcbiAqICAgLy8gYSB0cmFuc2l0aW9uIGFuaW1hdGlvbiB0aGF0IHdpbGwgYmUga2lja2VkIG9mZiB3aGVuIHRoZSBzdGF0ZSB2YWx1ZVxuICogICAvLyBib3VuZCB0byBcIm15QW5pbWF0aW9uVHJpZ2dlclwiIGNoYW5nZXMgZnJvbSBcIm9uXCIgdG8gXCJvZmZcIlxuICogICB0cmFuc2l0aW9uKFwib24gPT4gb2ZmXCIsIGFuaW1hdGUoNTAwKSksXG4gKlxuICogICAvLyBpdCBpcyBhbHNvIHBvc3NpYmxlIHRvIGRvIHJ1biB0aGUgc2FtZSBhbmltYXRpb24gZm9yIGJvdGggZGlyZWN0aW9uc1xuICogICB0cmFuc2l0aW9uKFwib24gPD0+IG9mZlwiLCBhbmltYXRlKDUwMCkpLFxuICpcbiAqICAgLy8gb3IgdG8gZGVmaW5lIG11bHRpcGxlIHN0YXRlcyBwYWlycyBzZXBhcmF0ZWQgYnkgY29tbWFzXG4gKiAgIHRyYW5zaXRpb24oXCJvbiA9PiBvZmYsIG9mZiA9PiB2b2lkXCIsIGFuaW1hdGUoNTAwKSksXG4gKlxuICogICAvLyB0aGlzIGlzIGEgY2F0Y2gtYWxsIHN0YXRlIGNoYW5nZSBmb3Igd2hlbiBhbiBlbGVtZW50IGlzIGluc2VydGVkIGludG9cbiAqICAgLy8gdGhlIHBhZ2UgYW5kIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBpcyB1bmtub3duXG4gKiAgIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICBhbmltYXRlKDUwMClcbiAqICAgXSksXG4gKlxuICogICAvLyB0aGlzIHdpbGwgY2FwdHVyZSBhIHN0YXRlIGNoYW5nZSBiZXR3ZWVuIGFueSBzdGF0ZXNcbiAqICAgdHJhbnNpdGlvbihcIiogPT4gKlwiLCBhbmltYXRlKFwiMXMgMHNcIikpLFxuICpcbiAqICAgLy8geW91IGNhbiBhbHNvIGdvIGZ1bGwgb3V0IGFuZCBpbmNsdWRlIGEgZnVuY3Rpb25cbiAqICAgdHJhbnNpdGlvbigoZnJvbVN0YXRlLCB0b1N0YXRlKSA9PiB7XG4gKiAgICAgLy8gd2hlbiBgdHJ1ZWAgdGhlbiBpdCB3aWxsIGFsbG93IHRoZSBhbmltYXRpb24gYmVsb3cgdG8gYmUgaW52b2tlZFxuICogICAgIHJldHVybiBmcm9tU3RhdGUgPT0gXCJvZmZcIiAmJiB0b1N0YXRlID09IFwib25cIjtcbiAqICAgfSwgYW5pbWF0ZShcIjFzIDBzXCIpKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIFRoZSB0ZW1wbGF0ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBjb21wb25lbnQgd2lsbCBtYWtlIHVzZSBvZiB0aGUgYG15QW5pbWF0aW9uVHJpZ2dlcmAgYW5pbWF0aW9uXG4gKiB0cmlnZ2VyIGJ5IGJpbmRpbmcgdG8gYW4gZWxlbWVudCB3aXRoaW4gaXRzIHRlbXBsYXRlIGNvZGUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyMgVGhlIGZpbmFsIGBhbmltYXRlYCBjYWxsXG4gKlxuICogSWYgdGhlIGZpbmFsIHN0ZXAgd2l0aGluIHRoZSB0cmFuc2l0aW9uIHN0ZXBzIGlzIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB0aGF0ICoqb25seSoqIHVzZXMgYVxuICogdGltaW5nIHZhbHVlIHdpdGggKipubyBzdHlsZSBkYXRhKiogdGhlbiBpdCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdXNlZCBhcyB0aGUgZmluYWwgYW5pbWF0aW9uIGFyY1xuICogZm9yIHRoZSBlbGVtZW50IHRvIGFuaW1hdGUgaXRzZWxmIHRvIHRoZSBmaW5hbCBzdGF0ZS4gVGhpcyBpbnZvbHZlcyBhbiBhdXRvbWF0aWMgbWl4IG9mXG4gKiBhZGRpbmcvcmVtb3ZpbmcgQ1NTIHN0eWxlcyBzbyB0aGF0IHRoZSBlbGVtZW50IHdpbGwgYmUgaW4gdGhlIGV4YWN0IHN0YXRlIGl0IHNob3VsZCBiZSBmb3IgdGhlXG4gKiBhcHBsaWVkIHN0YXRlIHRvIGJlIHByZXNlbnRlZCBjb3JyZWN0bHkuXG4gKlxuICogYGBgXG4gKiAvLyBzdGFydCBvZmYgYnkgaGlkaW5nIHRoZSBlbGVtZW50LCBidXQgbWFrZSBzdXJlIHRoYXQgaXQgYW5pbWF0ZXMgcHJvcGVybHkgdG8gd2hhdGV2ZXIgc3RhdGVcbiAqIC8vIGlzIGN1cnJlbnRseSBhY3RpdmUgZm9yIFwibXlBbmltYXRpb25UcmlnZ2VyXCJcbiAqIHRyYW5zaXRpb24oXCJ2b2lkID0+ICpcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwKVxuICogXSlcbiAqIGBgYFxuICpcbiAqICMjIyBVc2luZyA6ZW50ZXIgYW5kIDpsZWF2ZVxuICpcbiAqIEdpdmVuIHRoYXQgZW50ZXIgKGluc2VydGlvbikgYW5kIGxlYXZlIChyZW1vdmFsKSBhbmltYXRpb25zIGFyZSBzbyBjb21tb24sIHRoZSBgdHJhbnNpdGlvbmBcbiAqIGZ1bmN0aW9uIGFjY2VwdHMgYm90aCBgOmVudGVyYCBhbmQgYDpsZWF2ZWAgdmFsdWVzIHdoaWNoIGFyZSBhbGlhc2VzIGZvciB0aGUgYHZvaWQgPT4gKmAgYW5kIGAqXG4gKiA9PiB2b2lkYCBzdGF0ZSBjaGFuZ2VzLlxuICpcbiAqIGBgYFxuICogdHJhbnNpdGlvbihcIjplbnRlclwiLCBbXG4gKiAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqIF0pLFxuICogdHJhbnNpdGlvbihcIjpsZWF2ZVwiLCBbXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogIyMjIEJvb2xlYW4gdmFsdWVzXG4gKiBpZiBhIHRyaWdnZXIgYmluZGluZyB2YWx1ZSBpcyBhIGJvb2xlYW4gdmFsdWUgdGhlbiBpdCBjYW4gYmUgbWF0Y2hlZCB1c2luZyBhIHRyYW5zaXRpb25cbiAqIGV4cHJlc3Npb24gdGhhdCBjb21wYXJlcyBgdHJ1ZWAgYW5kIGBmYWxzZWAgb3IgYDFgIGFuZCBgMGAuXG4gKlxuICogYGBgXG4gKiAvLyBpbiB0aGUgdGVtcGxhdGVcbiAqIDxkaXYgW0BvcGVuQ2xvc2VdPVwib3BlbiA/IHRydWUgOiBmYWxzZVwiPi4uLjwvZGl2PlxuICpcbiAqIC8vIGluIHRoZSBjb21wb25lbnQgbWV0YWRhdGFcbiAqIHRyaWdnZXIoJ29wZW5DbG9zZScsIFtcbiAqICAgc3RhdGUoJ3RydWUnLCBzdHlsZSh7IGhlaWdodDogJyonIH0pKSxcbiAqICAgc3RhdGUoJ2ZhbHNlJywgc3R5bGUoeyBoZWlnaHQ6ICcwcHgnIH0pKSxcbiAqICAgdHJhbnNpdGlvbignZmFsc2UgPD0+IHRydWUnLCBhbmltYXRlKDUwMCkpXG4gKiBdKVxuICogYGBgXG4gKlxuICogIyMjIFVzaW5nIDppbmNyZW1lbnQgYW5kIDpkZWNyZW1lbnRcbiAqIEluIGFkZGl0aW9uIHRvIHRoZSA6ZW50ZXIgYW5kIDpsZWF2ZSB0cmFuc2l0aW9uIGFsaWFzZXMsIHRoZSA6aW5jcmVtZW50IGFuZCA6ZGVjcmVtZW50IGFsaWFzZXNcbiAqIGNhbiBiZSB1c2VkIHRvIGtpY2sgb2ZmIGEgdHJhbnNpdGlvbiB3aGVuIGEgbnVtZXJpYyB2YWx1ZSBoYXMgaW5jcmVhc2VkIG9yIGRlY3JlYXNlZCBpbiB2YWx1ZS5cbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Z3JvdXAsIGFuaW1hdGUsIHF1ZXJ5LCB0cmFuc2l0aW9uLCBzdHlsZSwgdHJpZ2dlcn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYmFubmVyLWNhcm91c2VsLWNvbXBvbmVudCcsXG4gKiAgIHN0eWxlczogW2BcbiAqICAgICAuYmFubmVyLWNvbnRhaW5lciB7XG4gKiAgICAgICAgcG9zaXRpb246cmVsYXRpdmU7XG4gKiAgICAgICAgaGVpZ2h0OjUwMHB4O1xuICogICAgICAgIG92ZXJmbG93OmhpZGRlbjtcbiAqICAgICAgfVxuICogICAgIC5iYW5uZXItY29udGFpbmVyID4gLmJhbm5lciB7XG4gKiAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gKiAgICAgICAgbGVmdDowO1xuICogICAgICAgIHRvcDowO1xuICogICAgICAgIGZvbnQtc2l6ZToyMDBweDtcbiAqICAgICAgICBsaW5lLWhlaWdodDo1MDBweDtcbiAqICAgICAgICBmb250LXdlaWdodDpib2xkO1xuICogICAgICAgIHRleHQtYWxpZ246Y2VudGVyO1xuICogICAgICAgIHdpZHRoOjEwMCU7XG4gKiAgICAgIH1cbiAqICAgYF0sXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwicHJldmlvdXMoKVwiPlByZXZpb3VzPC9idXR0b24+XG4gKiAgICAgPGJ1dHRvbiAoY2xpY2spPVwibmV4dCgpXCI+TmV4dDwvYnV0dG9uPlxuICogICAgIDxocj5cbiAqICAgICA8ZGl2IFtAYmFubmVyQW5pbWF0aW9uXT1cInNlbGVjdGVkSW5kZXhcIiBjbGFzcz1cImJhbm5lci1jb250YWluZXJcIj5cbiAqICAgICAgIDxkaXYgY2xhc3M9XCJiYW5uZXJcIiAqbmdGb3I9XCJsZXQgYmFubmVyIG9mIGJhbm5lcnNcIj4ge3sgYmFubmVyIH19IDwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignYmFubmVyQW5pbWF0aW9uJywgW1xuICogICAgICAgdHJhbnNpdGlvbihcIjppbmNyZW1lbnRcIiwgZ3JvdXAoW1xuICogICAgICAgICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgICAgICAgIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pLFxuICogICAgICAgICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSgnKicpKVxuICogICAgICAgICBdKSxcbiAqICAgICAgICAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICAgICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoeyBsZWZ0OiAnLTEwMCUnIH0pKVxuICogICAgICAgICBdKVxuICogICAgICAgXSkpLFxuICogICAgICAgdHJhbnNpdGlvbihcIjpkZWNyZW1lbnRcIiwgZ3JvdXAoW1xuICogICAgICAgICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgICAgICAgIHN0eWxlKHsgbGVmdDogJy0xMDAlJyB9KSxcbiAqICAgICAgICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgICAgICAgXSksXG4gKiAgICAgICAgIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKHsgbGVmdDogJzEwMCUnIH0pKVxuICogICAgICAgICBdKVxuICogICAgICAgXSkpXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIEJhbm5lckNhcm91c2VsQ29tcG9uZW50IHtcbiAqICAgYWxsQmFubmVyczogc3RyaW5nW10gPSBbJzEnLCAnMicsICczJywgJzQnXTtcbiAqICAgc2VsZWN0ZWRJbmRleDogbnVtYmVyID0gMDtcbiAqXG4gKiAgIGdldCBiYW5uZXJzKCkge1xuICogICAgICByZXR1cm4gW3RoaXMuYWxsQmFubmVyc1t0aGlzLnNlbGVjdGVkSW5kZXhdXTtcbiAqICAgfVxuICpcbiAqICAgcHJldmlvdXMoKSB7XG4gKiAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gTWF0aC5tYXgodGhpcy5zZWxlY3RlZEluZGV4IC0gMSwgMCk7XG4gKiAgIH1cbiAqXG4gKiAgIG5leHQoKSB7XG4gKiAgICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gTWF0aC5taW4odGhpcy5zZWxlY3RlZEluZGV4ICsgMSwgdGhpcy5hbGxCYW5uZXJzLmxlbmd0aCAtIDEpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zaXRpb24oXG4gICAgc3RhdGVDaGFuZ2VFeHByOiBzdHJpbmcgfCAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKSxcbiAgICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvblRyYW5zaXRpb25NZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlRyYW5zaXRpb24sIGV4cHI6IHN0YXRlQ2hhbmdlRXhwciwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYGFuaW1hdGlvbmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLlxuICpcbiAqIGB2YXIgbXlBbmltYXRpb24gPSBhbmltYXRpb24oLi4uKWAgaXMgZGVzaWduZWQgdG8gcHJvZHVjZSBhIHJldXNhYmxlIGFuaW1hdGlvbiB0aGF0IGNhbiBiZSBsYXRlclxuICogaW52b2tlZCBpbiBhbm90aGVyIGFuaW1hdGlvbiBvciBzZXF1ZW5jZS4gUmV1c2FibGUgYW5pbWF0aW9ucyBhcmUgZGVzaWduZWQgdG8gbWFrZSB1c2Ugb2ZcbiAqIGFuaW1hdGlvbiBwYXJhbWV0ZXJzIGFuZCB0aGUgcHJvZHVjZWQgYW5pbWF0aW9uIGNhbiBiZSB1c2VkIHZpYSB0aGUgYHVzZUFuaW1hdGlvbmAgbWV0aG9kLlxuICpcbiAqIGBgYFxuICogdmFyIGZhZGVBbmltYXRpb24gPSBhbmltYXRpb24oW1xuICogICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBzdGFydCB9fScgfSksXG4gKiAgIGFuaW1hdGUoJ3t7IHRpbWUgfX0nLFxuICogICAgIHN0eWxlKHsgb3BhY2l0eTogJ3t7IGVuZCB9fSd9KSlcbiAqIF0sIHsgcGFyYW1zOiB7IHRpbWU6ICcxMDAwbXMnLCBzdGFydDogMCwgZW5kOiAxIH19KTtcbiAqIGBgYFxuICpcbiAqIElmIHBhcmFtZXRlcnMgYXJlIGF0dGFjaGVkIHRvIGFuIGFuaW1hdGlvbiB0aGVuIHRoZXkgYWN0IGFzICoqZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWVzKiouIFdoZW4gYW5cbiAqIGFuaW1hdGlvbiBpcyBpbnZva2VkIHZpYSBgdXNlQW5pbWF0aW9uYCB0aGVuIHBhcmFtZXRlciB2YWx1ZXMgYXJlIGFsbG93ZWQgdG8gYmUgcGFzc2VkIGluXG4gKiBkaXJlY3RseS4gSWYgYW55IG9mIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVyIHZhbHVlcyBhcmUgbWlzc2luZyB0aGVuIHRoZSBkZWZhdWx0IHZhbHVlcyB3aWxsIGJlXG4gKiB1c2VkLlxuICpcbiAqIGBgYFxuICogdXNlQW5pbWF0aW9uKGZhZGVBbmltYXRpb24sIHtcbiAqICAgcGFyYW1zOiB7XG4gKiAgICAgdGltZTogJzJzJyxcbiAqICAgICBzdGFydDogMSxcbiAqICAgICBlbmQ6IDBcbiAqICAgfVxuICogfSlcbiAqIGBgYFxuICpcbiAqIElmIG9uZSBvciBtb3JlIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgYmVmb3JlIGFuaW1hdGVkIHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRpb24oXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlJlZmVyZW5jZSwgYW5pbWF0aW9uOiBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYGFuaW1hdGVDaGlsZGAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJdCB3b3JrcyBieSBhbGxvd2luZyBhIHF1ZXJpZWQgZWxlbWVudCB0byBleGVjdXRlIGl0cyBvd25cbiAqIGFuaW1hdGlvbiB3aXRoaW4gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS5cbiAqXG4gKiBFYWNoIHRpbWUgYW4gYW5pbWF0aW9uIGlzIHRyaWdnZXJlZCBpbiBhbmd1bGFyLCB0aGUgcGFyZW50IGFuaW1hdGlvblxuICogd2lsbCBhbHdheXMgZ2V0IHByaW9yaXR5IGFuZCBhbnkgY2hpbGQgYW5pbWF0aW9ucyB3aWxsIGJlIGJsb2NrZWQuIEluIG9yZGVyXG4gKiBmb3IgYSBjaGlsZCBhbmltYXRpb24gdG8gcnVuLCB0aGUgcGFyZW50IGFuaW1hdGlvbiBtdXN0IHF1ZXJ5IGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gKiBjb250YWluaW5nIGNoaWxkIGFuaW1hdGlvbnMgYW5kIHRoZW4gYWxsb3cgdGhlIGFuaW1hdGlvbnMgdG8gcnVuIHVzaW5nIGBhbmltYXRlQ2hpbGRgLlxuICpcbiAqIFRoZSBleGFtcGxlIEhUTUwgY29kZSBiZWxvdyBzaG93cyBib3RoIHBhcmVudCBhbmQgY2hpbGQgZWxlbWVudHMgdGhhdCBoYXZlIGFuaW1hdGlvblxuICogdHJpZ2dlcnMgdGhhdCB3aWxsIGV4ZWN1dGUgYXQgdGhlIHNhbWUgdGltZS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIHBhcmVudC1jaGlsZC5jb21wb25lbnQuaHRtbCAtLT5cbiAqIDxidXR0b24gKGNsaWNrKT1cImV4cCA9ISBleHBcIj5Ub2dnbGU8L2J1dHRvbj5cbiAqIDxocj5cbiAqXG4gKiA8ZGl2IFtAcGFyZW50QW5pbWF0aW9uXT1cImV4cFwiPlxuICogICA8aGVhZGVyPkhlbGxvPC9oZWFkZXI+XG4gKiAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIG9uZVxuICogICA8L2Rpdj5cbiAqICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgdHdvXG4gKiAgIDwvZGl2PlxuICogICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICB0aHJlZVxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogTm93IHdoZW4gdGhlIGBleHBgIHZhbHVlIGNoYW5nZXMgdG8gdHJ1ZSwgb25seSB0aGUgYHBhcmVudEFuaW1hdGlvbmAgYW5pbWF0aW9uIHdpbGwgYW5pbWF0ZVxuICogYmVjYXVzZSBpdCBoYXMgcHJpb3JpdHkuIEhvd2V2ZXIsIHVzaW5nIGBxdWVyeWAgYW5kIGBhbmltYXRlQ2hpbGRgIGVhY2ggb2YgdGhlIGlubmVyIGFuaW1hdGlvbnNcbiAqIGNhbiBhbHNvIGZpcmU6XG4gKlxuICogYGBgdHNcbiAqIC8vIHBhcmVudC1jaGlsZC5jb21wb25lbnQudHNcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgYW5pbWF0ZSwgc3R5bGUsIHF1ZXJ5LCBhbmltYXRlQ2hpbGR9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFyZW50LWNoaWxkLWNvbXBvbmVudCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdwYXJlbnRBbmltYXRpb24nLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKCdmYWxzZSA9PiB0cnVlJywgW1xuICogICAgICAgICBxdWVyeSgnaGVhZGVyJywgW1xuICogICAgICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgICAgICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogICAgICAgICBdKSxcbiAqICAgICAgICAgcXVlcnkoJ0BjaGlsZEFuaW1hdGlvbicsIFtcbiAqICAgICAgICAgICBhbmltYXRlQ2hpbGQoKVxuICogICAgICAgICBdKVxuICogICAgICAgXSlcbiAqICAgICBdKSxcbiAqICAgICB0cmlnZ2VyKCdjaGlsZEFuaW1hdGlvbicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24oJ2ZhbHNlID0+IHRydWUnLCBbXG4gKiAgICAgICAgIHN0eWxlKHsgb3BhY2l0eTogMCB9KSxcbiAqICAgICAgICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIFBhcmVudENoaWxkQ21wIHtcbiAqICAgZXhwOiBib29sZWFuID0gZmFsc2U7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGUgYW5pbWF0aW9uIGNvZGUgYWJvdmUsIHdoZW4gdGhlIGBwYXJlbnRBbmltYXRpb25gIHRyYW5zaXRpb24ga2lja3Mgb2ZmIGl0IGZpcnN0IHF1ZXJpZXMgdG9cbiAqIGZpbmQgdGhlIGhlYWRlciBlbGVtZW50IGFuZCBmYWRlcyBpdCBpbi4gSXQgdGhlbiBmaW5kcyBlYWNoIG9mIHRoZSBzdWIgZWxlbWVudHMgdGhhdCBjb250YWluIHRoZVxuICogYEBjaGlsZEFuaW1hdGlvbmAgdHJpZ2dlciBhbmQgdGhlbiBhbGxvd3MgZm9yIHRoZWlyIGFuaW1hdGlvbnMgdG8gZmlyZS5cbiAqXG4gKiBUaGlzIGV4YW1wbGUgY2FuIGJlIGZ1cnRoZXIgZXh0ZW5kZWQgYnkgdXNpbmcgc3RhZ2dlcjpcbiAqXG4gKiBgYGB0c1xuICogcXVlcnkoJ0BjaGlsZEFuaW1hdGlvbicsIHN0YWdnZXIoMTAwLCBbXG4gKiAgIGFuaW1hdGVDaGlsZCgpXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIE5vdyBlYWNoIG9mIHRoZSBzdWIgYW5pbWF0aW9ucyBzdGFydCBvZmYgd2l0aCByZXNwZWN0IHRvIHRoZSBgMTAwbXNgIHN0YWdnZXJpbmcgc3RlcC5cbiAqXG4gKiAjIyBUaGUgZmlyc3QgZnJhbWUgb2YgY2hpbGQgYW5pbWF0aW9uc1xuICogV2hlbiBzdWIgYW5pbWF0aW9ucyBhcmUgZXhlY3V0ZWQgdXNpbmcgYGFuaW1hdGVDaGlsZGAgdGhlIGFuaW1hdGlvbiBlbmdpbmUgd2lsbCBhbHdheXMgYXBwbHkgdGhlXG4gKiBmaXJzdCBmcmFtZSBvZiBldmVyeSBzdWIgYW5pbWF0aW9uIGltbWVkaWF0ZWx5IGF0IHRoZSBzdGFydCBvZiB0aGUgYW5pbWF0aW9uIHNlcXVlbmNlLiBUaGlzIHdheVxuICogdGhlIHBhcmVudCBhbmltYXRpb24gZG9lcyBub3QgbmVlZCB0byBzZXQgYW55IGluaXRpYWwgc3R5bGluZyBkYXRhIG9uIHRoZSBzdWIgZWxlbWVudHMgYmVmb3JlIHRoZVxuICogc3ViIGFuaW1hdGlvbnMga2ljayBvZmYuXG4gKlxuICogSW4gdGhlIGV4YW1wbGUgYWJvdmUgdGhlIGZpcnN0IGZyYW1lIG9mIHRoZSBgY2hpbGRBbmltYXRpb25gJ3MgYGZhbHNlID0+IHRydWVgIHRyYW5zaXRpb25cbiAqIGNvbnNpc3RzIG9mIGEgc3R5bGUgb2YgYG9wYWNpdHk6IDBgLiBUaGlzIGlzIGFwcGxpZWQgaW1tZWRpYXRlbHkgd2hlbiB0aGUgYHBhcmVudEFuaW1hdGlvbmBcbiAqIGFuaW1hdGlvbiB0cmFuc2l0aW9uIHNlcXVlbmNlIHN0YXJ0cy4gT25seSB0aGVuIHdoZW4gdGhlIGBAY2hpbGRBbmltYXRpb25gIGlzIHF1ZXJpZWQgYW5kIGNhbGxlZFxuICogd2l0aCBgYW5pbWF0ZUNoaWxkYCB3aWxsIGl0IHRoZW4gYW5pbWF0ZSB0byBpdHMgZGVzdGluYXRpb24gb2YgYG9wYWNpdHk6IDFgLlxuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZlYXR1cmUgZGVzaWduZWQgdG8gYmUgdXNlZCBhbG9uZ3NpZGUge0BsaW5rIHF1ZXJ5IHF1ZXJ5KCl9IGFuZCBpdCB3aWxsIG9ubHkgd29ya1xuICogd2l0aCBhbmltYXRpb25zIHRoYXQgYXJlIGFzc2lnbmVkIHVzaW5nIHRoZSBBbmd1bGFyIGFuaW1hdGlvbiBEU0wgKHRoaXMgbWVhbnMgdGhhdCBDU1Mga2V5ZnJhbWVzXG4gKiBhbmQgdHJhbnNpdGlvbnMgYXJlIG5vdCBoYW5kbGVkIGJ5IHRoaXMgQVBJKS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGVDaGlsZChvcHRpb25zOiBBbmltYXRlQ2hpbGRPcHRpb25zIHwgbnVsbCA9IG51bGwpOlxuICAgIEFuaW1hdGlvbkFuaW1hdGVDaGlsZE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuQW5pbWF0ZUNoaWxkLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgdXNlQW5pbWF0aW9uYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIEl0IGlzIHVzZWQgdG8ga2ljayBvZmYgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBpcyBjcmVhdGVkIHVzaW5nIHtAbGlua1xuICogYW5pbWF0aW9uIGFuaW1hdGlvbigpfS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZUFuaW1hdGlvbihcbiAgICBhbmltYXRpb246IEFuaW1hdGlvblJlZmVyZW5jZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6IEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVSZWYsIGFuaW1hdGlvbiwgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHF1ZXJ5YCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuXG4gKlxuICogcXVlcnkoKSBpcyB1c2VkIHRvIGZpbmQgb25lIG9yIG1vcmUgaW5uZXIgZWxlbWVudHMgd2l0aGluIHRoZSBjdXJyZW50IGVsZW1lbnQgdGhhdCBpc1xuICogYmVpbmcgYW5pbWF0ZWQgd2l0aGluIHRoZSBzZXF1ZW5jZS4gVGhlIHByb3ZpZGVkIGFuaW1hdGlvbiBzdGVwcyBhcmUgYXBwbGllZFxuICogdG8gdGhlIHF1ZXJpZWQgZWxlbWVudCAoYnkgZGVmYXVsdCwgYW4gYXJyYXkgaXMgcHJvdmlkZWQsIHRoZW4gdGhpcyB3aWxsIGJlXG4gKiB0cmVhdGVkIGFzIGFuIGFuaW1hdGlvbiBzZXF1ZW5jZSkuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogcXVlcnkoKSBpcyBkZXNpZ25lZCB0byBjb2xsZWN0IG11bHRpcGxlIGVsZW1lbnRzIGFuZCB3b3JrcyBpbnRlcm5hbGx5IGJ5IHVzaW5nXG4gKiBgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsYC4gQW4gYWRkaXRpb25hbCBvcHRpb25zIG9iamVjdCBjYW4gYmUgcHJvdmlkZWQgd2hpY2hcbiAqIGNhbiBiZSB1c2VkIHRvIGxpbWl0IHRoZSB0b3RhbCBhbW91bnQgb2YgaXRlbXMgdG8gYmUgY29sbGVjdGVkLlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnZGl2JywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBsaW1pdDogMSB9KVxuICogYGBgXG4gKlxuICogcXVlcnkoKSwgYnkgZGVmYXVsdCwgd2lsbCB0aHJvdyBhbiBlcnJvciB3aGVuIHplcm8gaXRlbXMgYXJlIGZvdW5kLiBJZiBhIHF1ZXJ5XG4gKiBoYXMgdGhlIGBvcHRpb25hbGAgZmxhZyBzZXQgdG8gdHJ1ZSB0aGVuIHRoaXMgZXJyb3Igd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIGBgYGpzXG4gKiBxdWVyeSgnLnNvbWUtZWxlbWVudC10aGF0LW1heS1ub3QtYmUtdGhlcmUnLCBbXG4gKiAgIGFuaW1hdGUoLi4uKSxcbiAqICAgYW5pbWF0ZSguLi4pXG4gKiBdLCB7IG9wdGlvbmFsOiB0cnVlIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgU3BlY2lhbCBTZWxlY3RvciBWYWx1ZXNcbiAqXG4gKiBUaGUgc2VsZWN0b3IgdmFsdWUgd2l0aGluIGEgcXVlcnkgY2FuIGNvbGxlY3QgZWxlbWVudHMgdGhhdCBjb250YWluIGFuZ3VsYXItc3BlY2lmaWNcbiAqIGNoYXJhY3RlcmlzdGljc1xuICogdXNpbmcgc3BlY2lhbCBwc2V1ZG8tc2VsZWN0b3JzIHRva2Vucy5cbiAqXG4gKiBUaGVzZSBpbmNsdWRlOlxuICpcbiAqICAtIFF1ZXJ5aW5nIGZvciBuZXdseSBpbnNlcnRlZC9yZW1vdmVkIGVsZW1lbnRzIHVzaW5nIGBxdWVyeShcIjplbnRlclwiKWAvYHF1ZXJ5KFwiOmxlYXZlXCIpYFxuICogIC0gUXVlcnlpbmcgYWxsIGN1cnJlbnRseSBhbmltYXRpbmcgZWxlbWVudHMgdXNpbmcgYHF1ZXJ5KFwiOmFuaW1hdGluZ1wiKWBcbiAqICAtIFF1ZXJ5aW5nIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlciB1c2luZyBgcXVlcnkoXCJAdHJpZ2dlck5hbWVcIilgXG4gKiAgLSBRdWVyeWluZyBhbGwgZWxlbWVudHMgdGhhdCBjb250YWluIGFuIGFuaW1hdGlvbiB0cmlnZ2VycyB1c2luZyBgcXVlcnkoXCJAKlwiKWBcbiAqICAtIEluY2x1ZGluZyB0aGUgY3VycmVudCBlbGVtZW50IGludG8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSB1c2luZyBgcXVlcnkoXCI6c2VsZlwiKWBcbiAqXG4gKlxuICogIEVhY2ggb2YgdGhlc2UgcHNldWRvLXNlbGVjdG9yIHRva2VucyBjYW4gYmUgbWVyZ2VkIHRvZ2V0aGVyIGludG8gYSBjb21iaW5lZCBxdWVyeSBzZWxlY3RvclxuICogc3RyaW5nOlxuICpcbiAqICBgYGBcbiAqICBxdWVyeSgnOnNlbGYsIC5yZWNvcmQ6ZW50ZXIsIC5yZWNvcmQ6bGVhdmUsIEBzdWJUcmlnZ2VyJywgWy4uLl0pXG4gKiAgYGBgXG4gKlxuICogIyMjIERlbW9cbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2lubmVyJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8ZGl2IFtAcXVlcnlBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICA8aDE+VGl0bGU8L2gxPlxuICogICAgICAgPGRpdiBjbGFzcz1cImNvbnRlbnRcIj5cbiAqICAgICAgICAgQmxhaCBibGFoIGJsYWhcbiAqICAgICAgIDwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICBgLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICB0cmlnZ2VyKCdxdWVyeUFuaW1hdGlvbicsIFtcbiAqICAgICAgdHJhbnNpdGlvbignKiA9PiBnb0FuaW1hdGUnLCBbXG4gKiAgICAgICAgLy8gaGlkZSB0aGUgaW5uZXIgZWxlbWVudHNcbiAqICAgICAgICBxdWVyeSgnaDEnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICAgICAgIHF1ZXJ5KCcuY29udGVudCcsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSksXG4gKlxuICogICAgICAgIC8vIGFuaW1hdGUgdGhlIGlubmVyIGVsZW1lbnRzIGluLCBvbmUgYnkgb25lXG4gKiAgICAgICAgcXVlcnkoJ2gxJywgYW5pbWF0ZSgxMDAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpLFxuICogICAgICAgIHF1ZXJ5KCcuY29udGVudCcsIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcbiAqICAgICAgXSlcbiAqICAgIF0pXG4gKiAgXVxuICogfSlcbiAqIGNsYXNzIENtcCB7XG4gKiAgIGV4cCA9ICcnO1xuICpcbiAqICAgZ29BbmltYXRlKCkge1xuICogICAgIHRoaXMuZXhwID0gJ2dvQW5pbWF0ZSc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcXVlcnkoXG4gICAgc2VsZWN0b3I6IHN0cmluZywgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uUXVlcnlPcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25RdWVyeU1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuUXVlcnksIHNlbGVjdG9yLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBzdGFnZ2VyYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIEl0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIGFuIGFuaW1hdGlvbiB7QGxpbmsgcXVlcnkgcXVlcnkoKX1cbiAqIGFuZCB3b3JrcyBieSBpc3N1aW5nIGEgdGltaW5nIGdhcCBiZXR3ZWVuIGFmdGVyIGVhY2ggcXVlcmllZCBpdGVtIGlzIGFuaW1hdGVkLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIEluIHRoZSBleGFtcGxlIGJlbG93IHRoZXJlIGlzIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCB3cmFwcyBhIGxpc3Qgb2YgaXRlbXMgc3RhbXBlZCBvdXRcbiAqIGJ5IGFuIG5nRm9yLiBUaGUgY29udGFpbmVyIGVsZW1lbnQgY29udGFpbnMgYW4gYW5pbWF0aW9uIHRyaWdnZXIgdGhhdCB3aWxsIGxhdGVyIGJlIHNldFxuICogdG8gcXVlcnkgZm9yIGVhY2ggb2YgdGhlIGlubmVyIGl0ZW1zLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gbGlzdC5jb21wb25lbnQuaHRtbCAtLT5cbiAqIDxidXR0b24gKGNsaWNrKT1cInRvZ2dsZSgpXCI+U2hvdyAvIEhpZGUgSXRlbXM8L2J1dHRvbj5cbiAqIDxociAvPlxuICogPGRpdiBbQGxpc3RBbmltYXRpb25dPVwiaXRlbXMubGVuZ3RoXCI+XG4gKiAgIDxkaXYgKm5nRm9yPVwibGV0IGl0ZW0gb2YgaXRlbXNcIj5cbiAqICAgICB7eyBpdGVtIH19XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBUaGUgY29tcG9uZW50IGNvZGUgZm9yIHRoaXMgbG9va3MgYXMgc3VjaDpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHt0cmlnZ2VyLCB0cmFuc2l0aW9uLCBzdHlsZSwgYW5pbWF0ZSwgcXVlcnksIHN0YWdnZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuICogQENvbXBvbmVudCh7XG4gKiAgIHRlbXBsYXRlVXJsOiAnbGlzdC5jb21wb25lbnQuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKCdsaXN0QW5pbWF0aW9uJywgW1xuICogICAgICAgIC8vLi4uXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIExpc3RDb21wb25lbnQge1xuICogICBpdGVtcyA9IFtdO1xuICpcbiAqICAgc2hvd0l0ZW1zKCkge1xuICogICAgIHRoaXMuaXRlbXMgPSBbMCwxLDIsMyw0XTtcbiAqICAgfVxuICpcbiAqICAgaGlkZUl0ZW1zKCkge1xuICogICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAqICAgfVxuICpcbiAqICAgdG9nZ2xlKCkge1xuICogICAgIHRoaXMuaXRlbXMubGVuZ3RoID8gdGhpcy5oaWRlSXRlbXMoKSA6IHRoaXMuc2hvd0l0ZW1zKCk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEFuZCBub3cgZm9yIHRoZSBhbmltYXRpb24gdHJpZ2dlciBjb2RlOlxuICpcbiAqIGBgYHRzXG4gKiB0cmlnZ2VyKCdsaXN0QW5pbWF0aW9uJywgW1xuICogICB0cmFuc2l0aW9uKCcqID0+IConLCBbIC8vIGVhY2ggdGltZSB0aGUgYmluZGluZyB2YWx1ZSBjaGFuZ2VzXG4gKiAgICAgcXVlcnkoJzpsZWF2ZScsIFtcbiAqICAgICAgIHN0YWdnZXIoMTAwLCBbXG4gKiAgICAgICAgIGFuaW1hdGUoJzAuNXMnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pLFxuICogICAgIHF1ZXJ5KCc6ZW50ZXInLCBbXG4gKiAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICBzdGFnZ2VyKDEwMCwgW1xuICogICAgICAgICBhbmltYXRlKCcwLjVzJywgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKVxuICogICAgICAgXSlcbiAqICAgICBdKVxuICogICBdKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIE5vdyBlYWNoIHRpbWUgdGhlIGl0ZW1zIGFyZSBhZGRlZC9yZW1vdmVkIHRoZW4gZWl0aGVyIHRoZSBvcGFjaXR5XG4gKiBmYWRlLWluIGFuaW1hdGlvbiB3aWxsIHJ1biBvciBlYWNoIHJlbW92ZWQgaXRlbSB3aWxsIGJlIGZhZGVkIG91dC5cbiAqIFdoZW4gZWl0aGVyIG9mIHRoZXNlIGFuaW1hdGlvbnMgb2NjdXIgdGhlbiBhIHN0YWdnZXIgZWZmZWN0IHdpbGwgYmVcbiAqIGFwcGxpZWQgYWZ0ZXIgZWFjaCBpdGVtJ3MgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdGFnZ2VyKFxuICAgIHRpbWluZ3M6IHN0cmluZyB8IG51bWJlcixcbiAgICBhbmltYXRpb246IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSk6IEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YWdnZXIsIHRpbWluZ3MsIGFuaW1hdGlvbn07XG59XG4iXX0=