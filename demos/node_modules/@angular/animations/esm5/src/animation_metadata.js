/**
 * @experimental Animation support is experimental.
 */
export var AUTO_STYLE = '*';
/**
 * `trigger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the
 * {@link Component#animations component animations metadata page} to gain a better
 * understanding of how animations in Angular are used.
 *
 * `trigger` Creates an animation trigger which will a list of {@link state state} and
 * {@link transition transition} entries that will be evaluated when the expression
 * bound to the trigger changes.
 *
 * Triggers are registered within the component annotation data under the
 * {@link Component#animations animations section}. An animation trigger can be placed on an element
 * within a template by referencing the name of the trigger followed by the expression value that
 the
 * trigger is bound to (in the form of `[@triggerName]="expression"`.
 *
 * Animation trigger bindings strigify values and then match the previous and current values against
 * any linked transitions. If a boolean value is provided into the trigger binding then it will both
 * be represented as `1` or `true` and `0` or `false` for a true and false boolean values
 * respectively.
 *
 * ### Usage
 *
 * `trigger` will create an animation trigger reference based on the provided `name` value. The
 * provided `animation` value is expected to be an array consisting of {@link state state} and
 * {@link transition transition} declarations.
 *
 * ```typescript
 * @Component({
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
 trigger by binding to an element within its template code.
 *
 * ```html
 * <!-- somewhere inside of my-component-tpl.html -->
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
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
 string]: any}): boolean {
 *   // notice that `element` and `params` are also available here
 *   return toState == 'yes-please-animate';
 * }
 *
 * @Component({
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
 * A special animation control binding called `@.disabled` can be placed on an element which will
 then disable animations for any inner animation triggers situated within the element as well as
 any animations on the element itself.
 *
 * When true, the `@.disabled` binding will prevent all animations from rendering. The example
 below shows how to use this feature:
 *
 * ```ts
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     <div [@.disabled]="isDisabled">
 *       <div [@childAnimation]="exp"></div>
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
 * The `@childAnimation` trigger will not animate because `@.disabled` prevents it from happening
 (when true).
 *
 * Note that `@.disabled` will only disable all animations (this means any animations running on
 * the same element will also be disabled).
 *
 * ### Disabling Animations Application-wide
 * When an area of the template is set to have animations disabled, **all** inner components will
 also have their animations disabled as well. This means that all animations for an angular
 application can be disabled by placing a host binding set on `@.disabled` on the topmost Angular
 component.
 *
 * ```ts
 * import {Component, HostBinding} from '@angular/core';
 *
 * @Component({
 *   selector: 'app-component',
 *   templateUrl: 'app.component.html',
 * })
 * class AppComponent {
 *   @HostBinding('@.disabled')
 *   public animationsDisabled = true;
 * }
 * ```
 *
 * ### What about animations that us `query()` and `animateChild()`?
 * Despite inner animations being disabled, a parent animation can {@link query query} for inner
 elements located in disabled areas of the template and still animate them as it sees fit. This is
 also the case for when a sub animation is queried by a parent and then later animated using {@link
 animateChild animateChild}.

 * ### Detecting when an animation is disabled
 * If a region of the DOM (or the entire application) has its animations disabled, then animation
 * trigger callbacks will still fire just as normal (only for zero seconds).
 *
 * When a trigger callback fires it will provide an instance of an {@link AnimationEvent}. If
 animations
 * are disabled then the `.disabled` flag on the event will be true.
 *
 * @experimental Animation support is experimental.
 */
export function trigger(name, definitions) {
    return { type: 7 /* Trigger */, name: name, definitions: definitions, options: {} };
}
/**
 * `animate` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `animate` specifies an animation step that will apply the provided `styles` data for a given
 * amount of time based on the provided `timing` expression value. Calls to `animate` are expected
 * to be used within {@link sequence an animation sequence}, {@link group group}, or {@link
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
 * - `styles` is the style input data which can either be a call to {@link style style} or {@link
 * keyframes keyframes}. If left empty then the styles from the destination state will be collected
 * and used (this is useful when describing an animation step that will complete an animation by
 * {@link transition#the-final-animate-call animating to the final state}).
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function animate(timings, styles) {
    if (styles === void 0) { styles = null; }
    return { type: 4 /* Animate */, styles: styles, timings: timings };
}
/**
 * `group` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `group` specifies a list of animation steps that are all run in parallel. Grouped animations are
 * useful when a series of styles must be animated/closed off at different starting/ending times.
 *
 * The `group` function can either be used within a {@link sequence sequence} or a {@link transition
 * transition} and it will only continue to the next instruction once all of the inner animation
 * steps have completed.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `group` animation function can either consist of {@link
 * style style} or {@link animate animate} function calls. Each call to `style()` or `animate()`
 * within a group will be executed instantly (use {@link keyframes keyframes} or a {@link
 * animate#usage animate() with a delay value} to offset styles to be applied at a later time).
 *
 * ```typescript
 * group([
 *   animate("1s", { background: "black" }))
 *   animate("2s", { color: "white" }))
 * ])
 * ```
 *
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function group(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 3 /* Group */, steps: steps, options: options };
}
/**
 * `sequence` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `sequence` Specifies a list of animation steps that are run one by one. (`sequence` is used by
 * default when an array is passed as animation data into {@link transition transition}.)
 *
 * The `sequence` function can either be used within a {@link group group} or a {@link transition
 * transition} and it will only continue to the next instruction once each of the inner animation
 * steps have completed.
 *
 * To perform animation styling in parallel with other animation steps then have a look at the
 * {@link group group} animation function.
 *
 * ### Usage
 *
 * The `steps` data that is passed into the `sequence` animation function can either consist of
 * {@link style style} or {@link animate animate} function calls. A call to `style()` will apply the
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function sequence(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 2 /* Sequence */, steps: steps, options: options };
}
/**
 * `style` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `style` declares a key/value object containing CSS properties/styles that can then be used for
 * {@link state animation states}, within an {@link sequence animation sequence}, or as styling data
 * for both {@link animate animate} and {@link keyframes keyframes}.
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function style(tokens) {
    return { type: 6 /* Style */, styles: tokens, offset: null };
}
/**
 * `state` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `state` declares an animation state within the given trigger. When a state is active within a
 * component then its associated styles will persist on the element that the trigger is attached to
 * (even when the animation ends).
 *
 * To animate between states, have a look at the animation {@link transition transition} DSL
 * function. To register states to an animation trigger please have a look at the {@link trigger
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
 * - `styles` refers to the {@link style styling data} that will be persisted on the element once
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function state(name, styles, options) {
    return { type: 0 /* State */, name: name, styles: styles, options: options };
}
/**
 * `keyframes` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `keyframes` specifies a collection of {@link style style} entries each optionally characterized
 * by an `offset` value.
 *
 * ### Usage
 *
 * The `keyframes` animation function is designed to be used alongside the {@link animate animate}
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function keyframes(steps) {
    return { type: 5 /* Keyframes */, steps: steps };
}
/**
 * `transition` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. If this information is new, please navigate to the {@link
 * Component#animations component animations metadata page} to gain a better understanding of
 * how animations in Angular are used.
 *
 * `transition` declares the {@link sequence sequence of animation steps} that will be run when the
 * provided `stateChangeExpr` value is satisfied. The `stateChangeExpr` consists of a `state1 =>
 * state2` which consists of two known states (use an asterix (`*`) to refer to a dynamic starting
 * and/or ending state).
 *
 * A function can also be provided as the `stateChangeExpr` argument for a transition and this
 * function will be executed each time a state change occurs. If the value returned within the
 * function is true then the associated animation will be run.
 *
 * Animation transitions are placed within an {@link trigger animation trigger}. For an transition
 * to animate to a state value and persist its styles then one or more {@link state animation
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
 * <div [@myAnimationTrigger]="myStatusExp">...</div>
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
 * <div [@openClose]="open ? true : false">...</div>
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
 * import {group, animate, query, transition, style, trigger} from '@angular/animations';
 * import {Component} from '@angular/core';
 *
 * @Component({
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
 *     <div [@bannerAnimation]="selectedIndex" class="banner-container">
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
 * {@example core/animation/ts/dsl/animation_example.ts region='Component'}
 *
 * @experimental Animation support is experimental.
 */
export function transition(stateChangeExpr, steps, options) {
    if (options === void 0) { options = null; }
    return { type: 1 /* Transition */, expr: stateChangeExpr, animation: steps, options: options };
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
 * @experimental Animation support is experimental.
 */
export function animation(steps, options) {
    if (options === void 0) { options = null; }
    return { type: 8 /* Reference */, animation: steps, options: options };
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
 * <div [@parentAnimation]="exp">
 *   <header>Hello</header>
 *   <div [@childAnimation]="exp">
 *       one
 *   </div>
 *   <div [@childAnimation]="exp">
 *       two
 *   </div>
 *   <div [@childAnimation]="exp">
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
 * import {trigger, transition, animate, style, query, animateChild} from '@angular/animations';
 * @Component({
 *   selector: 'parent-child-component',
 *   animations: [
 *     trigger('parentAnimation', [
 *       transition('false => true', [
 *         query('header', [
 *           style({ opacity: 0 }),
 *           animate(500, style({ opacity: 1 }))
 *         ]),
 *         query('@childAnimation', [
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
 * `@childAnimation` trigger and then allows for their animations to fire.
 *
 * This example can be further extended by using stagger:
 *
 * ```ts
 * query('@childAnimation', stagger(100, [
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
 * animation transition sequence starts. Only then when the `@childAnimation` is queried and called
 * with `animateChild` will it then animate to its destination of `opacity: 1`.
 *
 * Note that this feature designed to be used alongside {@link query query()} and it will only work
 * with animations that are assigned using the Angular animation DSL (this means that CSS keyframes
 * and transitions are not handled by this API).
 *
 * @experimental Animation support is experimental.
 */
export function animateChild(options) {
    if (options === void 0) { options = null; }
    return { type: 9 /* AnimateChild */, options: options };
}
/**
 * `useAnimation` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is used to kick off a reusable animation that is created using {@link
 * animation animation()}.
 *
 * @experimental Animation support is experimental.
 */
export function useAnimation(animation, options) {
    if (options === void 0) { options = null; }
    return { type: 10 /* AnimateRef */, animation: animation, options: options };
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
 *  - Querying elements that contain an animation trigger using `query("@triggerName")`
 *  - Querying all elements that contain an animation triggers using `query("@*")`
 *  - Including the current element into the animation sequence using `query(":self")`
 *
 *
 *  Each of these pseudo-selector tokens can be merged together into a combined query selector
 * string:
 *
 *  ```
 *  query(':self, .record:enter, .record:leave, @subTrigger', [...])
 *  ```
 *
 * ### Demo
 *
 * ```
 * @Component({
 *   selector: 'inner',
 *   template: `
 *     <div [@queryAnimation]="exp">
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
 * @experimental Animation support is experimental.
 */
export function query(selector, animation, options) {
    if (options === void 0) { options = null; }
    return { type: 11 /* Query */, selector: selector, animation: animation, options: options };
}
/**
 * `stagger` is an animation-specific function that is designed to be used inside of Angular's
 * animation DSL language. It is designed to be used inside of an animation {@link query query()}
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
 * <div [@listAnimation]="items.length">
 *   <div *ngFor="let item of items">
 *     {{ item }}
 *   </div>
 * </div>
 * ```
 *
 * The component code for this looks as such:
 *
 * ```ts
 * import {trigger, transition, style, animate, query, stagger} from '@angular/animations';
 * @Component({
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
 * @experimental Animation support is experimental.
 */
export function stagger(timings, animation) {
    return { type: 12 /* Stagger */, timings: timings, animation: animation };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX21ldGFkYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5pbWF0aW9ucy9zcmMvYW5pbWF0aW9uX21ldGFkYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQStFQSxNQUFNLENBQUMsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdVOUIsTUFBTSxrQkFBa0IsSUFBWSxFQUFFLFdBQWdDO0lBQ3BFLE1BQU0sQ0FBQyxFQUFDLElBQUksaUJBQStCLEVBQUUsSUFBSSxNQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBQyxDQUFDO0NBQzlFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0NELE1BQU0sa0JBQ0YsT0FBd0IsRUFBRSxNQUNYO0lBRFcsdUJBQUEsRUFBQSxhQUNYO0lBQ2pCLE1BQU0sQ0FBQyxFQUFDLElBQUksaUJBQStCLEVBQUUsTUFBTSxRQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUMvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQ0QsTUFBTSxnQkFDRixLQUEwQixFQUFFLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDckUsTUFBTSxDQUFDLEVBQUMsSUFBSSxlQUE2QixFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7Q0FDNUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NELE1BQU0sbUJBQW1CLEtBQTBCLEVBQUUsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUUxRixNQUFNLENBQUMsRUFBQyxJQUFJLGtCQUFnQyxFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7Q0FDL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0QsTUFBTSxnQkFDRixNQUMyQztJQUM3QyxNQUFNLENBQUMsRUFBQyxJQUFJLGVBQTZCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7Q0FDMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrREQsTUFBTSxnQkFDRixJQUFZLEVBQUUsTUFBOEIsRUFDNUMsT0FBeUM7SUFDM0MsTUFBTSxDQUFDLEVBQUMsSUFBSSxlQUE2QixFQUFFLElBQUksTUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7Q0FDbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQ0QsTUFBTSxvQkFBb0IsS0FBK0I7SUFDdkQsTUFBTSxDQUFDLEVBQUMsSUFBSSxtQkFBaUMsRUFBRSxLQUFLLE9BQUEsRUFBQyxDQUFDO0NBQ3ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlNRCxNQUFNLHFCQUNGLGVBQ3NFLEVBQ3RFLEtBQThDLEVBQzlDLE9BQXVDO0lBQXZDLHdCQUFBLEVBQUEsY0FBdUM7SUFDekMsTUFBTSxDQUFDLEVBQUMsSUFBSSxvQkFBa0MsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUNuRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBcUNELE1BQU0sb0JBQ0YsS0FBOEMsRUFDOUMsT0FBdUM7SUFBdkMsd0JBQUEsRUFBQSxjQUF1QztJQUN6QyxNQUFNLENBQUMsRUFBQyxJQUFJLG1CQUFpQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUMzRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtR0QsTUFBTSx1QkFBdUIsT0FBMEM7SUFBMUMsd0JBQUEsRUFBQSxjQUEwQztJQUVyRSxNQUFNLENBQUMsRUFBQyxJQUFJLHNCQUFvQyxFQUFFLE9BQU8sU0FBQSxFQUFDLENBQUM7Q0FDNUQ7Ozs7Ozs7O0FBU0QsTUFBTSx1QkFDRixTQUFxQyxFQUNyQyxPQUF1QztJQUF2Qyx3QkFBQSxFQUFBLGNBQXVDO0lBQ3pDLE1BQU0sQ0FBQyxFQUFDLElBQUkscUJBQWtDLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUNyRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBOEZELE1BQU0sZ0JBQ0YsUUFBZ0IsRUFBRSxTQUFrRCxFQUNwRSxPQUE0QztJQUE1Qyx3QkFBQSxFQUFBLGNBQTRDO0lBQzlDLE1BQU0sQ0FBQyxFQUFDLElBQUksZ0JBQTZCLEVBQUUsUUFBUSxVQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUMsQ0FBQztDQUMxRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdGRCxNQUFNLGtCQUNGLE9BQXdCLEVBQ3hCLFNBQWtEO0lBQ3BELE1BQU0sQ0FBQyxFQUFDLElBQUksa0JBQStCLEVBQUUsT0FBTyxTQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUMsQ0FBQztDQUNsRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgybVTdHlsZURhdGEgeyBba2V5OiBzdHJpbmddOiBzdHJpbmd8bnVtYmVyOyB9XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIGNyZWF0ZWQgaW50ZXJuYWxseVxuICogd2l0aGluIHRoZSBBbmd1bGFyIGFuaW1hdGlvbiBEU0wuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIHR5cGUgQW5pbWF0ZVRpbWluZ3MgPSB7XG4gIGR1cmF0aW9uOiBudW1iZXIsXG4gIGRlbGF5OiBudW1iZXIsXG4gIGVhc2luZzogc3RyaW5nIHwgbnVsbFxufTtcblxuLyoqXG4gKiBgQW5pbWF0aW9uT3B0aW9uc2AgcmVwcmVzZW50cyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCBpbnRvIG1vc3QgYW5pbWF0aW9uIERTTCBtZXRob2RzLlxuICogV2hlbiBvcHRpb25zIGFyZSBwcm92aWRlZCwgdGhlIGRlbGF5IHZhbHVlIG9mIGFuIGFuaW1hdGlvbiBjYW4gYmUgY2hhbmdlZCBhbmQgYW5pbWF0aW9uIGlucHV0XG4gKiBwYXJhbWV0ZXJzIGNhbiBiZSBwYXNzZWQgaW4gdG8gY2hhbmdlIHN0eWxpbmcgYW5kIHRpbWluZyBkYXRhIHdoZW4gYW4gYW5pbWF0aW9uIGlzIHN0YXJ0ZWQuXG4gKlxuICogVGhlIGZvbGxvd2luZyBhbmltYXRpb24gRFNMIGZ1bmN0aW9ucyBhcmUgYWJsZSB0byBhY2NlcHQgYW5pbWF0aW9uIG9wdGlvbiBkYXRhOlxuICpcbiAqIC0ge0BsaW5rIHRyYW5zaXRpb24gdHJhbnNpdGlvbigpfVxuICogLSB7QGxpbmsgc2VxdWVuY2Ugc2VxdWVuY2UoKX1cbiAqIC0ge0BsaW5rIGdyb3VwIGdyb3VwKCl9XG4gKiAtIHtAbGluayBxdWVyeSBxdWVyeSgpfVxuICogLSB7QGxpbmsgYW5pbWF0aW9uIGFuaW1hdGlvbigpfVxuICogLSB7QGxpbmsgdXNlQW5pbWF0aW9uIHVzZUFuaW1hdGlvbigpfVxuICogLSB7QGxpbmsgYW5pbWF0ZUNoaWxkIGFuaW1hdGVDaGlsZCgpfVxuICpcbiAqIFByb2dyYW1tYXRpYyBhbmltYXRpb25zIGJ1aWx0IHVzaW5nIHtAbGluayBBbmltYXRpb25CdWlsZGVyIHRoZSBBbmltYXRpb25CdWlsZGVyIHNlcnZpY2V9IGFsc29cbiAqIG1ha2UgdXNlIG9mIEFuaW1hdGlvbk9wdGlvbnMuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBkZWNsYXJlIGludGVyZmFjZSBBbmltYXRpb25PcHRpb25zIHtcbiAgZGVsYXk/OiBudW1iZXJ8c3RyaW5nO1xuICBwYXJhbXM/OiB7W25hbWU6IHN0cmluZ106IGFueX07XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIGNyZWF0ZWQgaW50ZXJuYWxseVxuICogd2l0aGluIHRoZSBBbmd1bGFyIGFuaW1hdGlvbiBEU0wgd2hlbiB7QGxpbmsgYW5pbWF0ZUNoaWxkIGFuaW1hdGVDaGlsZCgpfSBpcyB1c2VkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZGVjbGFyZSBpbnRlcmZhY2UgQW5pbWF0ZUNoaWxkT3B0aW9ucyBleHRlbmRzIEFuaW1hdGlvbk9wdGlvbnMgeyBkdXJhdGlvbj86IG51bWJlcnxzdHJpbmc7IH1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIFVzYWdlcyBvZiB0aGlzIGVudW0gYXJlIGNyZWF0ZWRcbiAqIGVhY2ggdGltZSBhbiBhbmltYXRpb24gRFNMIGZ1bmN0aW9uIGlzIHVzZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIEFuaW1hdGlvbk1ldGFkYXRhVHlwZSB7XG4gIFN0YXRlID0gMCxcbiAgVHJhbnNpdGlvbiA9IDEsXG4gIFNlcXVlbmNlID0gMixcbiAgR3JvdXAgPSAzLFxuICBBbmltYXRlID0gNCxcbiAgS2V5ZnJhbWVzID0gNSxcbiAgU3R5bGUgPSA2LFxuICBUcmlnZ2VyID0gNyxcbiAgUmVmZXJlbmNlID0gOCxcbiAgQW5pbWF0ZUNoaWxkID0gOSxcbiAgQW5pbWF0ZVJlZiA9IDEwLFxuICBRdWVyeSA9IDExLFxuICBTdGFnZ2VyID0gMTJcbn1cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGNvbnN0IEFVVE9fU1RZTEUgPSAnKic7XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uTWV0YWRhdGEgeyB0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGU7IH1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgdHJpZ2dlciB0cmlnZ2VyIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblRyaWdnZXJNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICBkZWZpbml0aW9uczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczoge3BhcmFtcz86IHtbbmFtZTogc3RyaW5nXTogYW55fX18bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgc3RhdGUgc3RhdGUgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGE7XG4gIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19O1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb24gYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uVHJhbnNpdGlvbk1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBleHByOiBzdHJpbmd8XG4gICAgICAoKGZyb21TdGF0ZTogc3RyaW5nLCB0b1N0YXRlOiBzdHJpbmcsIGVsZW1lbnQ/OiBhbnksXG4gICAgICAgIHBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiBib29sZWFuKTtcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xuICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5TWV0YWRhdGEgZXh0ZW5kcyBBbmltYXRpb25NZXRhZGF0YSB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG4gIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGF8QW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczogQW5pbWF0aW9uUXVlcnlPcHRpb25zfG51bGw7XG59XG5cbi8qKlxuICogTWV0YWRhdGEgcmVwcmVzZW50aW5nIHRoZSBlbnRyeSBvZiBhbmltYXRpb25zLiBJbnN0YW5jZXMgb2YgdGhpcyBpbnRlcmZhY2UgYXJlIHByb3ZpZGVkIHZpYSB0aGVcbiAqIGFuaW1hdGlvbiBEU0wgd2hlbiB0aGUge0BsaW5rIGtleWZyYW1lcyBrZXlmcmFtZXMgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uS2V5ZnJhbWVzU2VxdWVuY2VNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXTtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgc3R5bGUgc3R5bGUgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3R5bGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgc3R5bGVzOiAnKid8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn18QXJyYXk8e1trZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlcn18JyonPjtcbiAgb2Zmc2V0OiBudW1iZXJ8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgdGltaW5nczogc3RyaW5nfG51bWJlcnxBbmltYXRlVGltaW5ncztcbiAgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhfEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGF8bnVsbDtcbn1cblxuLyoqXG4gKiBNZXRhZGF0YSByZXByZXNlbnRpbmcgdGhlIGVudHJ5IG9mIGFuaW1hdGlvbnMuIEluc3RhbmNlcyBvZiB0aGlzIGludGVyZmFjZSBhcmUgcHJvdmlkZWQgdmlhIHRoZVxuICogYW5pbWF0aW9uIERTTCB3aGVuIHRoZSB7QGxpbmsgYW5pbWF0ZUNoaWxkIGFuaW1hdGVDaGlsZCBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25BbmltYXRlQ2hpbGRNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayB1c2VBbmltYXRpb24gdXNlQW5pbWF0aW9uIGFuaW1hdGlvbiBmdW5jdGlvbn0gaXMgY2FsbGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkFuaW1hdGVSZWZNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YTtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TZXF1ZW5jZU1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBncm91cCBncm91cCBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25Hcm91cE1ldGFkYXRhIGV4dGVuZHMgQW5pbWF0aW9uTWV0YWRhdGEge1xuICBzdGVwczogQW5pbWF0aW9uTWV0YWRhdGFbXTtcbiAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9uc3xudWxsO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBxdWVyeSBxdWVyeSBhbmltYXRpb24gZnVuY3Rpb259IGlzIGNhbGxlZC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGRlY2xhcmUgaW50ZXJmYWNlIEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyBleHRlbmRzIEFuaW1hdGlvbk9wdGlvbnMge1xuICBvcHRpb25hbD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBVc2VkIHRvIGxpbWl0IHRoZSB0b3RhbCBhbW91bnQgb2YgcmVzdWx0cyBmcm9tIHRoZSBzdGFydCBvZiB0aGUgcXVlcnkgbGlzdC5cbiAgICpcbiAgICogSWYgYSBuZWdhdGl2ZSB2YWx1ZSBpcyBwcm92aWRlZCB0aGVuIHRoZSBxdWVyaWVkIHJlc3VsdHMgd2lsbCBiZSBsaW1pdGVkIGZyb20gdGhlXG4gICAqIGVuZCBvZiB0aGUgcXVlcnkgbGlzdCB0b3dhcmRzIHRoZSBiZWdpbm5pbmcgKGUuZy4gaWYgYGxpbWl0OiAtM2AgaXMgdXNlZCB0aGVuIHRoZVxuICAgKiBmaW5hbCAzIChvciBsZXNzKSBxdWVyaWVkIHJlc3VsdHMgd2lsbCBiZSB1c2VkIGZvciB0aGUgYW5pbWF0aW9uKS5cbiAgICovXG4gIGxpbWl0PzogbnVtYmVyO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIHJlcHJlc2VudGluZyB0aGUgZW50cnkgb2YgYW5pbWF0aW9ucy4gSW5zdGFuY2VzIG9mIHRoaXMgaW50ZXJmYWNlIGFyZSBwcm92aWRlZCB2aWEgdGhlXG4gKiBhbmltYXRpb24gRFNMIHdoZW4gdGhlIHtAbGluayBzdGFnZ2VyIHN0YWdnZXIgYW5pbWF0aW9uIGZ1bmN0aW9ufSBpcyBjYWxsZWQuXG4gKlxuKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiovXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvblN0YWdnZXJNZXRhZGF0YSBleHRlbmRzIEFuaW1hdGlvbk1ldGFkYXRhIHtcbiAgdGltaW5nczogc3RyaW5nfG51bWJlcjtcbiAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YXxBbmltYXRpb25NZXRhZGF0YVtdO1xufVxuXG4vKipcbiAqIGB0cmlnZ2VyYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlXG4gKiB7QGxpbmsgQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlclxuICogdW5kZXJzdGFuZGluZyBvZiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGB0cmlnZ2VyYCBDcmVhdGVzIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHdoaWNoIHdpbGwgYSBsaXN0IG9mIHtAbGluayBzdGF0ZSBzdGF0ZX0gYW5kXG4gKiB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9ufSBlbnRyaWVzIHRoYXQgd2lsbCBiZSBldmFsdWF0ZWQgd2hlbiB0aGUgZXhwcmVzc2lvblxuICogYm91bmQgdG8gdGhlIHRyaWdnZXIgY2hhbmdlcy5cbiAqXG4gKiBUcmlnZ2VycyBhcmUgcmVnaXN0ZXJlZCB3aXRoaW4gdGhlIGNvbXBvbmVudCBhbm5vdGF0aW9uIGRhdGEgdW5kZXIgdGhlXG4gKiB7QGxpbmsgQ29tcG9uZW50I2FuaW1hdGlvbnMgYW5pbWF0aW9ucyBzZWN0aW9ufS4gQW4gYW5pbWF0aW9uIHRyaWdnZXIgY2FuIGJlIHBsYWNlZCBvbiBhbiBlbGVtZW50XG4gKiB3aXRoaW4gYSB0ZW1wbGF0ZSBieSByZWZlcmVuY2luZyB0aGUgbmFtZSBvZiB0aGUgdHJpZ2dlciBmb2xsb3dlZCBieSB0aGUgZXhwcmVzc2lvbiB2YWx1ZSB0aGF0XG4gdGhlXG4gKiB0cmlnZ2VyIGlzIGJvdW5kIHRvIChpbiB0aGUgZm9ybSBvZiBgW0B0cmlnZ2VyTmFtZV09XCJleHByZXNzaW9uXCJgLlxuICpcbiAqIEFuaW1hdGlvbiB0cmlnZ2VyIGJpbmRpbmdzIHN0cmlnaWZ5IHZhbHVlcyBhbmQgdGhlbiBtYXRjaCB0aGUgcHJldmlvdXMgYW5kIGN1cnJlbnQgdmFsdWVzIGFnYWluc3RcbiAqIGFueSBsaW5rZWQgdHJhbnNpdGlvbnMuIElmIGEgYm9vbGVhbiB2YWx1ZSBpcyBwcm92aWRlZCBpbnRvIHRoZSB0cmlnZ2VyIGJpbmRpbmcgdGhlbiBpdCB3aWxsIGJvdGhcbiAqIGJlIHJlcHJlc2VudGVkIGFzIGAxYCBvciBgdHJ1ZWAgYW5kIGAwYCBvciBgZmFsc2VgIGZvciBhIHRydWUgYW5kIGZhbHNlIGJvb2xlYW4gdmFsdWVzXG4gKiByZXNwZWN0aXZlbHkuXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogYHRyaWdnZXJgIHdpbGwgY3JlYXRlIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHJlZmVyZW5jZSBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgYG5hbWVgIHZhbHVlLiBUaGVcbiAqIHByb3ZpZGVkIGBhbmltYXRpb25gIHZhbHVlIGlzIGV4cGVjdGVkIHRvIGJlIGFuIGFycmF5IGNvbnNpc3Rpbmcgb2Yge0BsaW5rIHN0YXRlIHN0YXRlfSBhbmRcbiAqIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259IGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215LWNvbXBvbmVudC10cGwuaHRtbCcsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwibXlBbmltYXRpb25UcmlnZ2VyXCIsIFtcbiAqICAgICAgIHN0YXRlKC4uLiksXG4gKiAgICAgICBzdGF0ZSguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pLFxuICogICAgICAgdHJhbnNpdGlvbiguLi4pXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgbXlTdGF0dXNFeHAgPSBcInNvbWV0aGluZ1wiO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIHRlbXBsYXRlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbXBvbmVudCB3aWxsIG1ha2UgdXNlIG9mIHRoZSBgbXlBbmltYXRpb25UcmlnZ2VyYCBhbmltYXRpb25cbiB0cmlnZ2VyIGJ5IGJpbmRpbmcgdG8gYW4gZWxlbWVudCB3aXRoaW4gaXRzIHRlbXBsYXRlIGNvZGUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBzb21ld2hlcmUgaW5zaWRlIG9mIG15LWNvbXBvbmVudC10cGwuaHRtbCAtLT5cbiAqIDxkaXYgW0BteUFuaW1hdGlvblRyaWdnZXJdPVwibXlTdGF0dXNFeHBcIj4uLi48L2Rpdj5cbiAqIGBgYFxuICpcbiAqICMjIyBVc2luZyBhbiBpbmxpbmUgZnVuY3Rpb25cbiAqIFRoZSBgdHJhbnNpdGlvbmAgYW5pbWF0aW9uIG1ldGhvZCBhbHNvIHN1cHBvcnRzIHJlYWRpbmcgYW4gaW5saW5lIGZ1bmN0aW9uIHdoaWNoIGNhbiBkZWNpZGVcbiAqIGlmIGl0cyBhc3NvY2lhdGVkIGFuaW1hdGlvbiBzaG91bGQgYmUgcnVuLlxuICpcbiAqIGBgYFxuICogLy8gdGhpcyBtZXRob2Qgd2lsbCBiZSBydW4gZWFjaCB0aW1lIHRoZSBgbXlBbmltYXRpb25UcmlnZ2VyYFxuICogLy8gdHJpZ2dlciB2YWx1ZSBjaGFuZ2VzLi4uXG4gKiBmdW5jdGlvbiBteUlubGluZU1hdGNoZXJGbihmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50OiBhbnksIHBhcmFtczoge1trZXk6XG4gc3RyaW5nXTogYW55fSk6IGJvb2xlYW4ge1xuICogICAvLyBub3RpY2UgdGhhdCBgZWxlbWVudGAgYW5kIGBwYXJhbXNgIGFyZSBhbHNvIGF2YWlsYWJsZSBoZXJlXG4gKiAgIHJldHVybiB0b1N0YXRlID09ICd5ZXMtcGxlYXNlLWFuaW1hdGUnO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXktY29tcG9uZW50LXRwbC5odG1sJyxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ215QW5pbWF0aW9uVHJpZ2dlcicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24obXlJbmxpbmVNYXRjaGVyRm4sIFtcbiAqICAgICAgICAgLy8gdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZSBjb2RlXG4gKiAgICAgICBdKSxcbiAqICAgICBdKVxuICogICBdXG4gKiB9KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBteVN0YXR1c0V4cCA9IFwieWVzLXBsZWFzZS1hbmltYXRlXCI7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgaW5saW5lIG1ldGhvZCB3aWxsIGJlIHJ1biBlYWNoIHRpbWUgdGhlIHRyaWdnZXJcbiAqIHZhbHVlIGNoYW5nZXNcbiAqXG4gKiAjIyBEaXNhYmxlIEFuaW1hdGlvbnNcbiAqIEEgc3BlY2lhbCBhbmltYXRpb24gY29udHJvbCBiaW5kaW5nIGNhbGxlZCBgQC5kaXNhYmxlZGAgY2FuIGJlIHBsYWNlZCBvbiBhbiBlbGVtZW50IHdoaWNoIHdpbGxcbiB0aGVuIGRpc2FibGUgYW5pbWF0aW9ucyBmb3IgYW55IGlubmVyIGFuaW1hdGlvbiB0cmlnZ2VycyBzaXR1YXRlZCB3aXRoaW4gdGhlIGVsZW1lbnQgYXMgd2VsbCBhc1xuIGFueSBhbmltYXRpb25zIG9uIHRoZSBlbGVtZW50IGl0c2VsZi5cbiAqXG4gKiBXaGVuIHRydWUsIHRoZSBgQC5kaXNhYmxlZGAgYmluZGluZyB3aWxsIHByZXZlbnQgYWxsIGFuaW1hdGlvbnMgZnJvbSByZW5kZXJpbmcuIFRoZSBleGFtcGxlXG4gYmVsb3cgc2hvd3MgaG93IHRvIHVzZSB0aGlzIGZlYXR1cmU6XG4gKlxuICogYGBgdHNcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdiBbQC5kaXNhYmxlZF09XCJpc0Rpc2FibGVkXCI+XG4gKiAgICAgICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIGAsXG4gKiAgIGFuaW1hdGlvbnM6IFtcbiAqICAgICB0cmlnZ2VyKFwiY2hpbGRBbmltYXRpb25cIiwgW1xuICogICAgICAgLy8gLi4uXG4gKiAgICAgXSlcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgaXNEaXNhYmxlZCA9IHRydWU7XG4gKiAgIGV4cCA9ICcuLi4nO1xuICogfVxuICogYGBgXG4gKlxuICogVGhlIGBAY2hpbGRBbmltYXRpb25gIHRyaWdnZXIgd2lsbCBub3QgYW5pbWF0ZSBiZWNhdXNlIGBALmRpc2FibGVkYCBwcmV2ZW50cyBpdCBmcm9tIGhhcHBlbmluZ1xuICh3aGVuIHRydWUpLlxuICpcbiAqIE5vdGUgdGhhdCBgQC5kaXNhYmxlZGAgd2lsbCBvbmx5IGRpc2FibGUgYWxsIGFuaW1hdGlvbnMgKHRoaXMgbWVhbnMgYW55IGFuaW1hdGlvbnMgcnVubmluZyBvblxuICogdGhlIHNhbWUgZWxlbWVudCB3aWxsIGFsc28gYmUgZGlzYWJsZWQpLlxuICpcbiAqICMjIyBEaXNhYmxpbmcgQW5pbWF0aW9ucyBBcHBsaWNhdGlvbi13aWRlXG4gKiBXaGVuIGFuIGFyZWEgb2YgdGhlIHRlbXBsYXRlIGlzIHNldCB0byBoYXZlIGFuaW1hdGlvbnMgZGlzYWJsZWQsICoqYWxsKiogaW5uZXIgY29tcG9uZW50cyB3aWxsXG4gYWxzbyBoYXZlIHRoZWlyIGFuaW1hdGlvbnMgZGlzYWJsZWQgYXMgd2VsbC4gVGhpcyBtZWFucyB0aGF0IGFsbCBhbmltYXRpb25zIGZvciBhbiBhbmd1bGFyXG4gYXBwbGljYXRpb24gY2FuIGJlIGRpc2FibGVkIGJ5IHBsYWNpbmcgYSBob3N0IGJpbmRpbmcgc2V0IG9uIGBALmRpc2FibGVkYCBvbiB0aGUgdG9wbW9zdCBBbmd1bGFyXG4gY29tcG9uZW50LlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgSG9zdEJpbmRpbmd9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcC1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCcsXG4gKiB9KVxuICogY2xhc3MgQXBwQ29tcG9uZW50IHtcbiAqICAgQEhvc3RCaW5kaW5nKCdALmRpc2FibGVkJylcbiAqICAgcHVibGljIGFuaW1hdGlvbnNEaXNhYmxlZCA9IHRydWU7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgV2hhdCBhYm91dCBhbmltYXRpb25zIHRoYXQgdXMgYHF1ZXJ5KClgIGFuZCBgYW5pbWF0ZUNoaWxkKClgP1xuICogRGVzcGl0ZSBpbm5lciBhbmltYXRpb25zIGJlaW5nIGRpc2FibGVkLCBhIHBhcmVudCBhbmltYXRpb24gY2FuIHtAbGluayBxdWVyeSBxdWVyeX0gZm9yIGlubmVyXG4gZWxlbWVudHMgbG9jYXRlZCBpbiBkaXNhYmxlZCBhcmVhcyBvZiB0aGUgdGVtcGxhdGUgYW5kIHN0aWxsIGFuaW1hdGUgdGhlbSBhcyBpdCBzZWVzIGZpdC4gVGhpcyBpc1xuIGFsc28gdGhlIGNhc2UgZm9yIHdoZW4gYSBzdWIgYW5pbWF0aW9uIGlzIHF1ZXJpZWQgYnkgYSBwYXJlbnQgYW5kIHRoZW4gbGF0ZXIgYW5pbWF0ZWQgdXNpbmcge0BsaW5rXG4gYW5pbWF0ZUNoaWxkIGFuaW1hdGVDaGlsZH0uXG5cbiAqICMjIyBEZXRlY3Rpbmcgd2hlbiBhbiBhbmltYXRpb24gaXMgZGlzYWJsZWRcbiAqIElmIGEgcmVnaW9uIG9mIHRoZSBET00gKG9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb24pIGhhcyBpdHMgYW5pbWF0aW9ucyBkaXNhYmxlZCwgdGhlbiBhbmltYXRpb25cbiAqIHRyaWdnZXIgY2FsbGJhY2tzIHdpbGwgc3RpbGwgZmlyZSBqdXN0IGFzIG5vcm1hbCAob25seSBmb3IgemVybyBzZWNvbmRzKS5cbiAqXG4gKiBXaGVuIGEgdHJpZ2dlciBjYWxsYmFjayBmaXJlcyBpdCB3aWxsIHByb3ZpZGUgYW4gaW5zdGFuY2Ugb2YgYW4ge0BsaW5rIEFuaW1hdGlvbkV2ZW50fS4gSWZcbiBhbmltYXRpb25zXG4gKiBhcmUgZGlzYWJsZWQgdGhlbiB0aGUgYC5kaXNhYmxlZGAgZmxhZyBvbiB0aGUgZXZlbnQgd2lsbCBiZSB0cnVlLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlcihuYW1lOiBzdHJpbmcsIGRlZmluaXRpb25zOiBBbmltYXRpb25NZXRhZGF0YVtdKTogQW5pbWF0aW9uVHJpZ2dlck1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuVHJpZ2dlciwgbmFtZSwgZGVmaW5pdGlvbnMsIG9wdGlvbnM6IHt9fTtcbn1cblxuLyoqXG4gKiBgYW5pbWF0ZWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgYW5pbWF0ZWAgc3BlY2lmaWVzIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBhcHBseSB0aGUgcHJvdmlkZWQgYHN0eWxlc2AgZGF0YSBmb3IgYSBnaXZlblxuICogYW1vdW50IG9mIHRpbWUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGB0aW1pbmdgIGV4cHJlc3Npb24gdmFsdWUuIENhbGxzIHRvIGBhbmltYXRlYCBhcmUgZXhwZWN0ZWRcbiAqIHRvIGJlIHVzZWQgd2l0aGluIHtAbGluayBzZXF1ZW5jZSBhbiBhbmltYXRpb24gc2VxdWVuY2V9LCB7QGxpbmsgZ3JvdXAgZ3JvdXB9LCBvciB7QGxpbmtcbiAqIHRyYW5zaXRpb24gdHJhbnNpdGlvbn0uXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogVGhlIGBhbmltYXRlYCBmdW5jdGlvbiBhY2NlcHRzIHR3byBpbnB1dCBwYXJhbWV0ZXJzOiBgdGltaW5nYCBhbmQgYHN0eWxlc2A6XG4gKlxuICogLSBgdGltaW5nYCBpcyBhIHN0cmluZyBiYXNlZCB2YWx1ZSB0aGF0IGNhbiBiZSBhIGNvbWJpbmF0aW9uIG9mIGEgZHVyYXRpb24gd2l0aCBvcHRpb25hbCBkZWxheVxuICogYW5kIGVhc2luZyB2YWx1ZXMuIFRoZSBmb3JtYXQgZm9yIHRoZSBleHByZXNzaW9uIGJyZWFrcyBkb3duIHRvIGBkdXJhdGlvbiBkZWxheSBlYXNpbmdgXG4gKiAodGhlcmVmb3JlIGEgdmFsdWUgc3VjaCBhcyBgMXMgMTAwbXMgZWFzZS1vdXRgIHdpbGwgYmUgcGFyc2UgaXRzZWxmIGludG8gYGR1cmF0aW9uPTEwMDAsXG4gKiBkZWxheT0xMDAsIGVhc2luZz1lYXNlLW91dGAuIElmIGEgbnVtZXJpYyB2YWx1ZSBpcyBwcm92aWRlZCB0aGVuIHRoYXQgd2lsbCBiZSB1c2VkIGFzIHRoZVxuICogYGR1cmF0aW9uYCB2YWx1ZSBpbiBtaWxsaXNlY29uZCBmb3JtLlxuICogLSBgc3R5bGVzYCBpcyB0aGUgc3R5bGUgaW5wdXQgZGF0YSB3aGljaCBjYW4gZWl0aGVyIGJlIGEgY2FsbCB0byB7QGxpbmsgc3R5bGUgc3R5bGV9IG9yIHtAbGlua1xuICoga2V5ZnJhbWVzIGtleWZyYW1lc30uIElmIGxlZnQgZW1wdHkgdGhlbiB0aGUgc3R5bGVzIGZyb20gdGhlIGRlc3RpbmF0aW9uIHN0YXRlIHdpbGwgYmUgY29sbGVjdGVkXG4gKiBhbmQgdXNlZCAodGhpcyBpcyB1c2VmdWwgd2hlbiBkZXNjcmliaW5nIGFuIGFuaW1hdGlvbiBzdGVwIHRoYXQgd2lsbCBjb21wbGV0ZSBhbiBhbmltYXRpb24gYnlcbiAqIHtAbGluayB0cmFuc2l0aW9uI3RoZS1maW5hbC1hbmltYXRlLWNhbGwgYW5pbWF0aW5nIHRvIHRoZSBmaW5hbCBzdGF0ZX0pLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHZhcmlvdXMgZnVuY3Rpb25zIGZvciBzcGVjaWZ5aW5nIHRpbWluZyBkYXRhXG4gKiBhbmltYXRlKDUwMCwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCIxc1wiLCBzdHlsZSguLi4pKVxuICogYW5pbWF0ZShcIjEwMG1zIDAuNXNcIiwgc3R5bGUoLi4uKSlcbiAqIGFuaW1hdGUoXCI1cyBlYXNlXCIsIHN0eWxlKC4uLikpXG4gKiBhbmltYXRlKFwiNXMgMTBtcyBjdWJpYy1iZXppZXIoLjE3LC42NywuODgsLjEpXCIsIHN0eWxlKC4uLikpXG4gKlxuICogLy8gZWl0aGVyIHN0eWxlKCkgb2Yga2V5ZnJhbWVzKCkgY2FuIGJlIHVzZWRcbiAqIGFuaW1hdGUoNTAwLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIgfSkpXG4gKiBhbmltYXRlKDUwMCwga2V5ZnJhbWVzKFtcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImJsdWVcIiB9KSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZDogXCJyZWRcIiB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuaW1hdGUoXG4gICAgdGltaW5nczogc3RyaW5nIHwgbnVtYmVyLCBzdHlsZXM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEgfCBBbmltYXRpb25LZXlmcmFtZXNTZXF1ZW5jZU1ldGFkYXRhIHxcbiAgICAgICAgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlLCBzdHlsZXMsIHRpbWluZ3N9O1xufVxuXG4vKipcbiAqIGBncm91cGAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgZ3JvdXBgIHNwZWNpZmllcyBhIGxpc3Qgb2YgYW5pbWF0aW9uIHN0ZXBzIHRoYXQgYXJlIGFsbCBydW4gaW4gcGFyYWxsZWwuIEdyb3VwZWQgYW5pbWF0aW9ucyBhcmVcbiAqIHVzZWZ1bCB3aGVuIGEgc2VyaWVzIG9mIHN0eWxlcyBtdXN0IGJlIGFuaW1hdGVkL2Nsb3NlZCBvZmYgYXQgZGlmZmVyZW50IHN0YXJ0aW5nL2VuZGluZyB0aW1lcy5cbiAqXG4gKiBUaGUgYGdyb3VwYCBmdW5jdGlvbiBjYW4gZWl0aGVyIGJlIHVzZWQgd2l0aGluIGEge0BsaW5rIHNlcXVlbmNlIHNlcXVlbmNlfSBvciBhIHtAbGluayB0cmFuc2l0aW9uXG4gKiB0cmFuc2l0aW9ufSBhbmQgaXQgd2lsbCBvbmx5IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9uY2UgYWxsIG9mIHRoZSBpbm5lciBhbmltYXRpb25cbiAqIHN0ZXBzIGhhdmUgY29tcGxldGVkLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIFRoZSBgc3RlcHNgIGRhdGEgdGhhdCBpcyBwYXNzZWQgaW50byB0aGUgYGdyb3VwYCBhbmltYXRpb24gZnVuY3Rpb24gY2FuIGVpdGhlciBjb25zaXN0IG9mIHtAbGlua1xuICogc3R5bGUgc3R5bGV9IG9yIHtAbGluayBhbmltYXRlIGFuaW1hdGV9IGZ1bmN0aW9uIGNhbGxzLiBFYWNoIGNhbGwgdG8gYHN0eWxlKClgIG9yIGBhbmltYXRlKClgXG4gKiB3aXRoaW4gYSBncm91cCB3aWxsIGJlIGV4ZWN1dGVkIGluc3RhbnRseSAodXNlIHtAbGluayBrZXlmcmFtZXMga2V5ZnJhbWVzfSBvciBhIHtAbGlua1xuICogYW5pbWF0ZSN1c2FnZSBhbmltYXRlKCkgd2l0aCBhIGRlbGF5IHZhbHVlfSB0byBvZmZzZXQgc3R5bGVzIHRvIGJlIGFwcGxpZWQgYXQgYSBsYXRlciB0aW1lKS5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBncm91cChbXG4gKiAgIGFuaW1hdGUoXCIxc1wiLCB7IGJhY2tncm91bmQ6IFwiYmxhY2tcIiB9KSlcbiAqICAgYW5pbWF0ZShcIjJzXCIsIHsgY29sb3I6IFwid2hpdGVcIiB9KSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YVtdLCBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25Hcm91cE1ldGFkYXRhIHtcbiAgcmV0dXJuIHt0eXBlOiBBbmltYXRpb25NZXRhZGF0YVR5cGUuR3JvdXAsIHN0ZXBzLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgc2VxdWVuY2VgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYHNlcXVlbmNlYCBTcGVjaWZpZXMgYSBsaXN0IG9mIGFuaW1hdGlvbiBzdGVwcyB0aGF0IGFyZSBydW4gb25lIGJ5IG9uZS4gKGBzZXF1ZW5jZWAgaXMgdXNlZCBieVxuICogZGVmYXVsdCB3aGVuIGFuIGFycmF5IGlzIHBhc3NlZCBhcyBhbmltYXRpb24gZGF0YSBpbnRvIHtAbGluayB0cmFuc2l0aW9uIHRyYW5zaXRpb259LilcbiAqXG4gKiBUaGUgYHNlcXVlbmNlYCBmdW5jdGlvbiBjYW4gZWl0aGVyIGJlIHVzZWQgd2l0aGluIGEge0BsaW5rIGdyb3VwIGdyb3VwfSBvciBhIHtAbGluayB0cmFuc2l0aW9uXG4gKiB0cmFuc2l0aW9ufSBhbmQgaXQgd2lsbCBvbmx5IGNvbnRpbnVlIHRvIHRoZSBuZXh0IGluc3RydWN0aW9uIG9uY2UgZWFjaCBvZiB0aGUgaW5uZXIgYW5pbWF0aW9uXG4gKiBzdGVwcyBoYXZlIGNvbXBsZXRlZC5cbiAqXG4gKiBUbyBwZXJmb3JtIGFuaW1hdGlvbiBzdHlsaW5nIGluIHBhcmFsbGVsIHdpdGggb3RoZXIgYW5pbWF0aW9uIHN0ZXBzIHRoZW4gaGF2ZSBhIGxvb2sgYXQgdGhlXG4gKiB7QGxpbmsgZ3JvdXAgZ3JvdXB9IGFuaW1hdGlvbiBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBUaGUgYHN0ZXBzYCBkYXRhIHRoYXQgaXMgcGFzc2VkIGludG8gdGhlIGBzZXF1ZW5jZWAgYW5pbWF0aW9uIGZ1bmN0aW9uIGNhbiBlaXRoZXIgY29uc2lzdCBvZlxuICoge0BsaW5rIHN0eWxlIHN0eWxlfSBvciB7QGxpbmsgYW5pbWF0ZSBhbmltYXRlfSBmdW5jdGlvbiBjYWxscy4gQSBjYWxsIHRvIGBzdHlsZSgpYCB3aWxsIGFwcGx5IHRoZVxuICogcHJvdmlkZWQgc3R5bGluZyBkYXRhIGltbWVkaWF0ZWx5IHdoaWxlIGEgY2FsbCB0byBgYW5pbWF0ZSgpYCB3aWxsIGFwcGx5IGl0cyBzdHlsaW5nIGRhdGEgb3ZlciBhXG4gKiBnaXZlbiB0aW1lIGRlcGVuZGluZyBvbiBpdHMgdGltaW5nIGRhdGEuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogc2VxdWVuY2UoW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICogICBhbmltYXRlKFwiMXNcIiwgeyBvcGFjaXR5OiAxIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2Uoc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhW10sIG9wdGlvbnM6IEFuaW1hdGlvbk9wdGlvbnMgfCBudWxsID0gbnVsbCk6XG4gICAgQW5pbWF0aW9uU2VxdWVuY2VNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlNlcXVlbmNlLCBzdGVwcywgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHN0eWxlYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBzdHlsZWAgZGVjbGFyZXMgYSBrZXkvdmFsdWUgb2JqZWN0IGNvbnRhaW5pbmcgQ1NTIHByb3BlcnRpZXMvc3R5bGVzIHRoYXQgY2FuIHRoZW4gYmUgdXNlZCBmb3JcbiAqIHtAbGluayBzdGF0ZSBhbmltYXRpb24gc3RhdGVzfSwgd2l0aGluIGFuIHtAbGluayBzZXF1ZW5jZSBhbmltYXRpb24gc2VxdWVuY2V9LCBvciBhcyBzdHlsaW5nIGRhdGFcbiAqIGZvciBib3RoIHtAbGluayBhbmltYXRlIGFuaW1hdGV9IGFuZCB7QGxpbmsga2V5ZnJhbWVzIGtleWZyYW1lc30uXG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogYHN0eWxlYCB0YWtlcyBpbiBhIGtleS92YWx1ZSBzdHJpbmcgbWFwIGFzIGRhdGEgYW5kIGV4cGVjdHMgb25lIG9yIG1vcmUgQ1NTIHByb3BlcnR5L3ZhbHVlIHBhaXJzXG4gKiB0byBiZSBkZWZpbmVkLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIC8vIHN0cmluZyB2YWx1ZXMgYXJlIHVzZWQgZm9yIGNzcyBwcm9wZXJ0aWVzXG4gKiBzdHlsZSh7IGJhY2tncm91bmQ6IFwicmVkXCIsIGNvbG9yOiBcImJsdWVcIiB9KVxuICpcbiAqIC8vIG51bWVyaWNhbCAocGl4ZWwpIHZhbHVlcyBhcmUgYWxzbyBzdXBwb3J0ZWRcbiAqIHN0eWxlKHsgd2lkdGg6IDEwMCwgaGVpZ2h0OiAwIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMjIEF1dG8tc3R5bGVzICh1c2luZyBgKmApXG4gKlxuICogV2hlbiBhbiBhc3Rlcml4IChgKmApIGNoYXJhY3RlciBpcyB1c2VkIGFzIGEgdmFsdWUgdGhlbiBpdCB3aWxsIGJlIGRldGVjdGVkIGZyb20gdGhlIGVsZW1lbnRcbiAqIGJlaW5nIGFuaW1hdGVkIGFuZCBhcHBsaWVkIGFzIGFuaW1hdGlvbiBkYXRhIHdoZW4gdGhlIGFuaW1hdGlvbiBzdGFydHMuXG4gKlxuICogVGhpcyBmZWF0dXJlIHByb3ZlcyB1c2VmdWwgZm9yIGEgc3RhdGUgZGVwZW5kaW5nIG9uIGxheW91dCBhbmQvb3IgZW52aXJvbm1lbnQgZmFjdG9yczsgaW4gc3VjaFxuICogY2FzZXMgdGhlIHN0eWxlcyBhcmUgY2FsY3VsYXRlZCBqdXN0IGJlZm9yZSB0aGUgYW5pbWF0aW9uIHN0YXJ0cy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyB0aGUgc3RlcHMgYmVsb3cgd2lsbCBhbmltYXRlIGZyb20gMCB0byB0aGVcbiAqIC8vIGFjdHVhbCBoZWlnaHQgb2YgdGhlIGVsZW1lbnRcbiAqIHN0eWxlKHsgaGVpZ2h0OiAwIH0pLFxuICogYW5pbWF0ZShcIjFzXCIsIHN0eWxlKHsgaGVpZ2h0OiBcIipcIiB9KSlcbiAqIGBgYFxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2FuaW1hdGlvbi90cy9kc2wvYW5pbWF0aW9uX2V4YW1wbGUudHMgcmVnaW9uPSdDb21wb25lbnQnfVxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3R5bGUoXG4gICAgdG9rZW5zOiAnKicgfCB7W2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyfSB8XG4gICAgQXJyYXk8JyonfHtba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXJ9Pik6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdHlsZSwgc3R5bGVzOiB0b2tlbnMsIG9mZnNldDogbnVsbH07XG59XG5cbi8qKlxuICogYHN0YXRlYCBpcyBhbiBhbmltYXRpb24tc3BlY2lmaWMgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBBbmd1bGFyJ3NcbiAqIGFuaW1hdGlvbiBEU0wgbGFuZ3VhZ2UuIElmIHRoaXMgaW5mb3JtYXRpb24gaXMgbmV3LCBwbGVhc2UgbmF2aWdhdGUgdG8gdGhlIHtAbGlua1xuICogQ29tcG9uZW50I2FuaW1hdGlvbnMgY29tcG9uZW50IGFuaW1hdGlvbnMgbWV0YWRhdGEgcGFnZX0gdG8gZ2FpbiBhIGJldHRlciB1bmRlcnN0YW5kaW5nIG9mXG4gKiBob3cgYW5pbWF0aW9ucyBpbiBBbmd1bGFyIGFyZSB1c2VkLlxuICpcbiAqIGBzdGF0ZWAgZGVjbGFyZXMgYW4gYW5pbWF0aW9uIHN0YXRlIHdpdGhpbiB0aGUgZ2l2ZW4gdHJpZ2dlci4gV2hlbiBhIHN0YXRlIGlzIGFjdGl2ZSB3aXRoaW4gYVxuICogY29tcG9uZW50IHRoZW4gaXRzIGFzc29jaWF0ZWQgc3R5bGVzIHdpbGwgcGVyc2lzdCBvbiB0aGUgZWxlbWVudCB0aGF0IHRoZSB0cmlnZ2VyIGlzIGF0dGFjaGVkIHRvXG4gKiAoZXZlbiB3aGVuIHRoZSBhbmltYXRpb24gZW5kcykuXG4gKlxuICogVG8gYW5pbWF0ZSBiZXR3ZWVuIHN0YXRlcywgaGF2ZSBhIGxvb2sgYXQgdGhlIGFuaW1hdGlvbiB7QGxpbmsgdHJhbnNpdGlvbiB0cmFuc2l0aW9ufSBEU0xcbiAqIGZ1bmN0aW9uLiBUbyByZWdpc3RlciBzdGF0ZXMgdG8gYW4gYW5pbWF0aW9uIHRyaWdnZXIgcGxlYXNlIGhhdmUgYSBsb29rIGF0IHRoZSB7QGxpbmsgdHJpZ2dlclxuICogdHJpZ2dlcn0gZnVuY3Rpb24uXG4gKlxuICogIyMjIyBUaGUgYHZvaWRgIHN0YXRlXG4gKlxuICogVGhlIGB2b2lkYCBzdGF0ZSB2YWx1ZSBpcyBhIHJlc2VydmVkIHdvcmQgdGhhdCBhbmd1bGFyIHVzZXMgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIGVsZW1lbnQgaXMgbm90XG4gKiBhcGFydCBvZiB0aGUgYXBwbGljYXRpb24gYW55bW9yZSAoZS5nLiB3aGVuIGFuIGBuZ0lmYCBldmFsdWF0ZXMgdG8gZmFsc2UgdGhlbiB0aGUgc3RhdGUgb2YgdGhlXG4gKiBhc3NvY2lhdGVkIGVsZW1lbnQgaXMgdm9pZCkuXG4gKlxuICogIyMjIyBUaGUgYCpgIChkZWZhdWx0KSBzdGF0ZVxuICpcbiAqIFRoZSBgKmAgc3RhdGUgKHdoZW4gc3R5bGVkKSBpcyBhIGZhbGxiYWNrIHN0YXRlIHRoYXQgd2lsbCBiZSB1c2VkIGlmIHRoZSBzdGF0ZSB0aGF0IGlzIGJlaW5nXG4gKiBhbmltYXRlZCBpcyBub3QgZGVjbGFyZWQgd2l0aGluIHRoZSB0cmlnZ2VyLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIGBzdGF0ZWAgd2lsbCBkZWNsYXJlIGFuIGFuaW1hdGlvbiBzdGF0ZSB3aXRoIGl0cyBhc3NvY2lhdGVkIHN0eWxlc1xuICogd2l0aGluIHRoZSBnaXZlbiB0cmlnZ2VyLlxuICpcbiAqIC0gYHN0YXRlTmFtZUV4cHJgIGNhbiBiZSBvbmUgb3IgbW9yZSBzdGF0ZSBuYW1lcyBzZXBhcmF0ZWQgYnkgY29tbWFzLlxuICogLSBgc3R5bGVzYCByZWZlcnMgdG8gdGhlIHtAbGluayBzdHlsZSBzdHlsaW5nIGRhdGF9IHRoYXQgd2lsbCBiZSBwZXJzaXN0ZWQgb24gdGhlIGVsZW1lbnQgb25jZVxuICogdGhlIHN0YXRlIGhhcyBiZWVuIHJlYWNoZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gXCJ2b2lkXCIgaXMgYSByZXNlcnZlZCBuYW1lIGZvciBhIHN0YXRlIGFuZCBpcyB1c2VkIHRvIHJlcHJlc2VudFxuICogLy8gdGhlIHN0YXRlIGluIHdoaWNoIGFuIGVsZW1lbnQgaXMgZGV0YWNoZWQgZnJvbSBmcm9tIHRoZSBhcHBsaWNhdGlvbi5cbiAqIHN0YXRlKFwidm9pZFwiLCBzdHlsZSh7IGhlaWdodDogMCB9KSlcbiAqXG4gKiAvLyB1c2VyLWRlZmluZWQgc3RhdGVzXG4gKiBzdGF0ZShcImNsb3NlZFwiLCBzdHlsZSh7IGhlaWdodDogMCB9KSlcbiAqIHN0YXRlKFwib3BlbiwgdmlzaWJsZVwiLCBzdHlsZSh7IGhlaWdodDogXCIqXCIgfSkpXG4gKiBgYGBcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS9hbmltYXRpb24vdHMvZHNsL2FuaW1hdGlvbl9leGFtcGxlLnRzIHJlZ2lvbj0nQ29tcG9uZW50J31cbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0YXRlKFxuICAgIG5hbWU6IHN0cmluZywgc3R5bGVzOiBBbmltYXRpb25TdHlsZU1ldGFkYXRhLFxuICAgIG9wdGlvbnM/OiB7cGFyYW1zOiB7W25hbWU6IHN0cmluZ106IGFueX19KTogQW5pbWF0aW9uU3RhdGVNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlN0YXRlLCBuYW1lLCBzdHlsZXMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBrZXlmcmFtZXNgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSWYgdGhpcyBpbmZvcm1hdGlvbiBpcyBuZXcsIHBsZWFzZSBuYXZpZ2F0ZSB0byB0aGUge0BsaW5rXG4gKiBDb21wb25lbnQjYW5pbWF0aW9ucyBjb21wb25lbnQgYW5pbWF0aW9ucyBtZXRhZGF0YSBwYWdlfSB0byBnYWluIGEgYmV0dGVyIHVuZGVyc3RhbmRpbmcgb2ZcbiAqIGhvdyBhbmltYXRpb25zIGluIEFuZ3VsYXIgYXJlIHVzZWQuXG4gKlxuICogYGtleWZyYW1lc2Agc3BlY2lmaWVzIGEgY29sbGVjdGlvbiBvZiB7QGxpbmsgc3R5bGUgc3R5bGV9IGVudHJpZXMgZWFjaCBvcHRpb25hbGx5IGNoYXJhY3Rlcml6ZWRcbiAqIGJ5IGFuIGBvZmZzZXRgIHZhbHVlLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIFRoZSBga2V5ZnJhbWVzYCBhbmltYXRpb24gZnVuY3Rpb24gaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBhbG9uZ3NpZGUgdGhlIHtAbGluayBhbmltYXRlIGFuaW1hdGV9XG4gKiBhbmltYXRpb24gZnVuY3Rpb24uIEluc3RlYWQgb2YgYXBwbHlpbmcgYW5pbWF0aW9ucyBmcm9tIHdoZXJlIHRoZXkgYXJlIGN1cnJlbnRseSB0byB0aGVpclxuICogZGVzdGluYXRpb24sIGtleWZyYW1lcyBjYW4gZGVzY3JpYmUgaG93IGVhY2ggc3R5bGUgZW50cnkgaXMgYXBwbGllZCBhbmQgYXQgd2hhdCBwb2ludCB3aXRoaW4gdGhlXG4gKiBhbmltYXRpb24gYXJjIChtdWNoIGxpa2UgQ1NTIEtleWZyYW1lIEFuaW1hdGlvbnMgZG8pLlxuICpcbiAqIEZvciBlYWNoIGBzdHlsZSgpYCBlbnRyeSBhbiBgb2Zmc2V0YCB2YWx1ZSBjYW4gYmUgc2V0LiBEb2luZyBzbyBhbGxvd3MgdG8gc3BlY2lmeSBhdCB3aGF0XG4gKiBwZXJjZW50YWdlIG9mIHRoZSBhbmltYXRlIHRpbWUgdGhlIHN0eWxlcyB3aWxsIGJlIGFwcGxpZWQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogLy8gdGhlIHByb3ZpZGVkIG9mZnNldCB2YWx1ZXMgZGVzY3JpYmUgd2hlbiBlYWNoIGJhY2tncm91bmRDb2xvciB2YWx1ZSBpcyBhcHBsaWVkLlxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiLCBvZmZzZXQ6IDAgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcImJsdWVcIiwgb2Zmc2V0OiAwLjIgfSksXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcIm9yYW5nZVwiLCBvZmZzZXQ6IDAuMyB9KSxcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiwgb2Zmc2V0OiAxIH0pXG4gKiBdKSlcbiAqIGBgYFxuICpcbiAqIEFsdGVybmF0aXZlbHksIGlmIHRoZXJlIGFyZSBubyBgb2Zmc2V0YCB2YWx1ZXMgdXNlZCB3aXRoaW4gdGhlIHN0eWxlIGVudHJpZXMgdGhlbiB0aGUgb2Zmc2V0c1xuICogd2lsbCBiZSBjYWxjdWxhdGVkIGF1dG9tYXRpY2FsbHkuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogYW5pbWF0ZShcIjVzXCIsIGtleWZyYW1lcyhbXG4gKiAgIHN0eWxlKHsgYmFja2dyb3VuZENvbG9yOiBcInJlZFwiIH0pIC8vIG9mZnNldCA9IDBcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmx1ZVwiIH0pIC8vIG9mZnNldCA9IDAuMzNcbiAqICAgc3R5bGUoeyBiYWNrZ3JvdW5kQ29sb3I6IFwib3JhbmdlXCIgfSkgLy8gb2Zmc2V0ID0gMC42NlxuICogICBzdHlsZSh7IGJhY2tncm91bmRDb2xvcjogXCJibGFja1wiIH0pIC8vIG9mZnNldCA9IDFcbiAqIF0pKVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBrZXlmcmFtZXMoc3RlcHM6IEFuaW1hdGlvblN0eWxlTWV0YWRhdGFbXSk6IEFuaW1hdGlvbktleWZyYW1lc1NlcXVlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5LZXlmcmFtZXMsIHN0ZXBzfTtcbn1cblxuLyoqXG4gKiBgdHJhbnNpdGlvbmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJZiB0aGlzIGluZm9ybWF0aW9uIGlzIG5ldywgcGxlYXNlIG5hdmlnYXRlIHRvIHRoZSB7QGxpbmtcbiAqIENvbXBvbmVudCNhbmltYXRpb25zIGNvbXBvbmVudCBhbmltYXRpb25zIG1ldGFkYXRhIHBhZ2V9IHRvIGdhaW4gYSBiZXR0ZXIgdW5kZXJzdGFuZGluZyBvZlxuICogaG93IGFuaW1hdGlvbnMgaW4gQW5ndWxhciBhcmUgdXNlZC5cbiAqXG4gKiBgdHJhbnNpdGlvbmAgZGVjbGFyZXMgdGhlIHtAbGluayBzZXF1ZW5jZSBzZXF1ZW5jZSBvZiBhbmltYXRpb24gc3RlcHN9IHRoYXQgd2lsbCBiZSBydW4gd2hlbiB0aGVcbiAqIHByb3ZpZGVkIGBzdGF0ZUNoYW5nZUV4cHJgIHZhbHVlIGlzIHNhdGlzZmllZC4gVGhlIGBzdGF0ZUNoYW5nZUV4cHJgIGNvbnNpc3RzIG9mIGEgYHN0YXRlMSA9PlxuICogc3RhdGUyYCB3aGljaCBjb25zaXN0cyBvZiB0d28ga25vd24gc3RhdGVzICh1c2UgYW4gYXN0ZXJpeCAoYCpgKSB0byByZWZlciB0byBhIGR5bmFtaWMgc3RhcnRpbmdcbiAqIGFuZC9vciBlbmRpbmcgc3RhdGUpLlxuICpcbiAqIEEgZnVuY3Rpb24gY2FuIGFsc28gYmUgcHJvdmlkZWQgYXMgdGhlIGBzdGF0ZUNoYW5nZUV4cHJgIGFyZ3VtZW50IGZvciBhIHRyYW5zaXRpb24gYW5kIHRoaXNcbiAqIGZ1bmN0aW9uIHdpbGwgYmUgZXhlY3V0ZWQgZWFjaCB0aW1lIGEgc3RhdGUgY2hhbmdlIG9jY3Vycy4gSWYgdGhlIHZhbHVlIHJldHVybmVkIHdpdGhpbiB0aGVcbiAqIGZ1bmN0aW9uIGlzIHRydWUgdGhlbiB0aGUgYXNzb2NpYXRlZCBhbmltYXRpb24gd2lsbCBiZSBydW4uXG4gKlxuICogQW5pbWF0aW9uIHRyYW5zaXRpb25zIGFyZSBwbGFjZWQgd2l0aGluIGFuIHtAbGluayB0cmlnZ2VyIGFuaW1hdGlvbiB0cmlnZ2VyfS4gRm9yIGFuIHRyYW5zaXRpb25cbiAqIHRvIGFuaW1hdGUgdG8gYSBzdGF0ZSB2YWx1ZSBhbmQgcGVyc2lzdCBpdHMgc3R5bGVzIHRoZW4gb25lIG9yIG1vcmUge0BsaW5rIHN0YXRlIGFuaW1hdGlvblxuICogc3RhdGVzfSBpcyBleHBlY3RlZCB0byBiZSBkZWZpbmVkLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIEFuIGFuaW1hdGlvbiB0cmFuc2l0aW9uIGlzIGtpY2tlZCBvZmYgdGhlIGBzdGF0ZUNoYW5nZUV4cHJgIHByZWRpY2F0ZSBldmFsdWF0ZXMgdG8gdHJ1ZSBiYXNlZCBvblxuICogd2hhdCB0aGUgcHJldmlvdXMgc3RhdGUgaXMgYW5kIHdoYXQgdGhlIGN1cnJlbnQgc3RhdGUgaGFzIGJlY29tZS4gSW4gb3RoZXIgd29yZHMsIGlmIGEgdHJhbnNpdGlvblxuICogaXMgZGVmaW5lZCB0aGF0IG1hdGNoZXMgdGhlIG9sZC9jdXJyZW50IHN0YXRlIGNyaXRlcmlhIHRoZW4gdGhlIGFzc29jaWF0ZWQgYW5pbWF0aW9uIHdpbGwgYmVcbiAqIHRyaWdnZXJlZC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiAvLyBhbGwgdHJhbnNpdGlvbi9zdGF0ZSBjaGFuZ2VzIGFyZSBkZWZpbmVkIHdpdGhpbiBhbiBhbmltYXRpb24gdHJpZ2dlclxuICogdHJpZ2dlcihcIm15QW5pbWF0aW9uVHJpZ2dlclwiLCBbXG4gKiAgIC8vIGlmIGEgc3RhdGUgaXMgZGVmaW5lZCB0aGVuIGl0cyBzdHlsZXMgd2lsbCBiZSBwZXJzaXN0ZWQgd2hlbiB0aGVcbiAqICAgLy8gYW5pbWF0aW9uIGhhcyBmdWxseSBjb21wbGV0ZWQgaXRzZWxmXG4gKiAgIHN0YXRlKFwib25cIiwgc3R5bGUoeyBiYWNrZ3JvdW5kOiBcImdyZWVuXCIgfSkpLFxuICogICBzdGF0ZShcIm9mZlwiLCBzdHlsZSh7IGJhY2tncm91bmQ6IFwiZ3JleVwiIH0pKSxcbiAqXG4gKiAgIC8vIGEgdHJhbnNpdGlvbiBhbmltYXRpb24gdGhhdCB3aWxsIGJlIGtpY2tlZCBvZmYgd2hlbiB0aGUgc3RhdGUgdmFsdWVcbiAqICAgLy8gYm91bmQgdG8gXCJteUFuaW1hdGlvblRyaWdnZXJcIiBjaGFuZ2VzIGZyb20gXCJvblwiIHRvIFwib2ZmXCJcbiAqICAgdHJhbnNpdGlvbihcIm9uID0+IG9mZlwiLCBhbmltYXRlKDUwMCkpLFxuICpcbiAqICAgLy8gaXQgaXMgYWxzbyBwb3NzaWJsZSB0byBkbyBydW4gdGhlIHNhbWUgYW5pbWF0aW9uIGZvciBib3RoIGRpcmVjdGlvbnNcbiAqICAgdHJhbnNpdGlvbihcIm9uIDw9PiBvZmZcIiwgYW5pbWF0ZSg1MDApKSxcbiAqXG4gKiAgIC8vIG9yIHRvIGRlZmluZSBtdWx0aXBsZSBzdGF0ZXMgcGFpcnMgc2VwYXJhdGVkIGJ5IGNvbW1hc1xuICogICB0cmFuc2l0aW9uKFwib24gPT4gb2ZmLCBvZmYgPT4gdm9pZFwiLCBhbmltYXRlKDUwMCkpLFxuICpcbiAqICAgLy8gdGhpcyBpcyBhIGNhdGNoLWFsbCBzdGF0ZSBjaGFuZ2UgZm9yIHdoZW4gYW4gZWxlbWVudCBpcyBpbnNlcnRlZCBpbnRvXG4gKiAgIC8vIHRoZSBwYWdlIGFuZCB0aGUgZGVzdGluYXRpb24gc3RhdGUgaXMgdW5rbm93blxuICogICB0cmFuc2l0aW9uKFwidm9pZCA9PiAqXCIsIFtcbiAqICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgYW5pbWF0ZSg1MDApXG4gKiAgIF0pLFxuICpcbiAqICAgLy8gdGhpcyB3aWxsIGNhcHR1cmUgYSBzdGF0ZSBjaGFuZ2UgYmV0d2VlbiBhbnkgc3RhdGVzXG4gKiAgIHRyYW5zaXRpb24oXCIqID0+ICpcIiwgYW5pbWF0ZShcIjFzIDBzXCIpKSxcbiAqXG4gKiAgIC8vIHlvdSBjYW4gYWxzbyBnbyBmdWxsIG91dCBhbmQgaW5jbHVkZSBhIGZ1bmN0aW9uXG4gKiAgIHRyYW5zaXRpb24oKGZyb21TdGF0ZSwgdG9TdGF0ZSkgPT4ge1xuICogICAgIC8vIHdoZW4gYHRydWVgIHRoZW4gaXQgd2lsbCBhbGxvdyB0aGUgYW5pbWF0aW9uIGJlbG93IHRvIGJlIGludm9rZWRcbiAqICAgICByZXR1cm4gZnJvbVN0YXRlID09IFwib2ZmXCIgJiYgdG9TdGF0ZSA9PSBcIm9uXCI7XG4gKiAgIH0sIGFuaW1hdGUoXCIxcyAwc1wiKSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBUaGUgdGVtcGxhdGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29tcG9uZW50IHdpbGwgbWFrZSB1c2Ugb2YgdGhlIGBteUFuaW1hdGlvblRyaWdnZXJgIGFuaW1hdGlvblxuICogdHJpZ2dlciBieSBiaW5kaW5nIHRvIGFuIGVsZW1lbnQgd2l0aGluIGl0cyB0ZW1wbGF0ZSBjb2RlLlxuICpcbiAqIGBgYGh0bWxcbiAqIDwhLS0gc29tZXdoZXJlIGluc2lkZSBvZiBteS1jb21wb25lbnQtdHBsLmh0bWwgLS0+XG4gKiA8ZGl2IFtAbXlBbmltYXRpb25UcmlnZ2VyXT1cIm15U3RhdHVzRXhwXCI+Li4uPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiAjIyMjIFRoZSBmaW5hbCBgYW5pbWF0ZWAgY2FsbFxuICpcbiAqIElmIHRoZSBmaW5hbCBzdGVwIHdpdGhpbiB0aGUgdHJhbnNpdGlvbiBzdGVwcyBpcyBhIGNhbGwgdG8gYGFuaW1hdGUoKWAgdGhhdCAqKm9ubHkqKiB1c2VzIGFcbiAqIHRpbWluZyB2YWx1ZSB3aXRoICoqbm8gc3R5bGUgZGF0YSoqIHRoZW4gaXQgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IHVzZWQgYXMgdGhlIGZpbmFsIGFuaW1hdGlvbiBhcmNcbiAqIGZvciB0aGUgZWxlbWVudCB0byBhbmltYXRlIGl0c2VsZiB0byB0aGUgZmluYWwgc3RhdGUuIFRoaXMgaW52b2x2ZXMgYW4gYXV0b21hdGljIG1peCBvZlxuICogYWRkaW5nL3JlbW92aW5nIENTUyBzdHlsZXMgc28gdGhhdCB0aGUgZWxlbWVudCB3aWxsIGJlIGluIHRoZSBleGFjdCBzdGF0ZSBpdCBzaG91bGQgYmUgZm9yIHRoZVxuICogYXBwbGllZCBzdGF0ZSB0byBiZSBwcmVzZW50ZWQgY29ycmVjdGx5LlxuICpcbiAqIGBgYFxuICogLy8gc3RhcnQgb2ZmIGJ5IGhpZGluZyB0aGUgZWxlbWVudCwgYnV0IG1ha2Ugc3VyZSB0aGF0IGl0IGFuaW1hdGVzIHByb3Blcmx5IHRvIHdoYXRldmVyIHN0YXRlXG4gKiAvLyBpcyBjdXJyZW50bHkgYWN0aXZlIGZvciBcIm15QW5pbWF0aW9uVHJpZ2dlclwiXG4gKiB0cmFuc2l0aW9uKFwidm9pZCA9PiAqXCIsIFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICBhbmltYXRlKDUwMClcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNpbmcgOmVudGVyIGFuZCA6bGVhdmVcbiAqXG4gKiBHaXZlbiB0aGF0IGVudGVyIChpbnNlcnRpb24pIGFuZCBsZWF2ZSAocmVtb3ZhbCkgYW5pbWF0aW9ucyBhcmUgc28gY29tbW9uLCB0aGUgYHRyYW5zaXRpb25gXG4gKiBmdW5jdGlvbiBhY2NlcHRzIGJvdGggYDplbnRlcmAgYW5kIGA6bGVhdmVgIHZhbHVlcyB3aGljaCBhcmUgYWxpYXNlcyBmb3IgdGhlIGB2b2lkID0+ICpgIGFuZCBgKlxuICogPT4gdm9pZGAgc3RhdGUgY2hhbmdlcy5cbiAqXG4gKiBgYGBcbiAqIHRyYW5zaXRpb24oXCI6ZW50ZXJcIiwgW1xuICogICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiBdKSxcbiAqIHRyYW5zaXRpb24oXCI6bGVhdmVcIiwgW1xuICogICBhbmltYXRlKDUwMCwgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogXSlcbiAqIGBgYFxuICpcbiAqICMjIyBCb29sZWFuIHZhbHVlc1xuICogaWYgYSB0cmlnZ2VyIGJpbmRpbmcgdmFsdWUgaXMgYSBib29sZWFuIHZhbHVlIHRoZW4gaXQgY2FuIGJlIG1hdGNoZWQgdXNpbmcgYSB0cmFuc2l0aW9uXG4gKiBleHByZXNzaW9uIHRoYXQgY29tcGFyZXMgYHRydWVgIGFuZCBgZmFsc2VgIG9yIGAxYCBhbmQgYDBgLlxuICpcbiAqIGBgYFxuICogLy8gaW4gdGhlIHRlbXBsYXRlXG4gKiA8ZGl2IFtAb3BlbkNsb3NlXT1cIm9wZW4gPyB0cnVlIDogZmFsc2VcIj4uLi48L2Rpdj5cbiAqXG4gKiAvLyBpbiB0aGUgY29tcG9uZW50IG1ldGFkYXRhXG4gKiB0cmlnZ2VyKCdvcGVuQ2xvc2UnLCBbXG4gKiAgIHN0YXRlKCd0cnVlJywgc3R5bGUoeyBoZWlnaHQ6ICcqJyB9KSksXG4gKiAgIHN0YXRlKCdmYWxzZScsIHN0eWxlKHsgaGVpZ2h0OiAnMHB4JyB9KSksXG4gKiAgIHRyYW5zaXRpb24oJ2ZhbHNlIDw9PiB0cnVlJywgYW5pbWF0ZSg1MDApKVxuICogXSlcbiAqIGBgYFxuICpcbiAqICMjIyBVc2luZyA6aW5jcmVtZW50IGFuZCA6ZGVjcmVtZW50XG4gKiBJbiBhZGRpdGlvbiB0byB0aGUgOmVudGVyIGFuZCA6bGVhdmUgdHJhbnNpdGlvbiBhbGlhc2VzLCB0aGUgOmluY3JlbWVudCBhbmQgOmRlY3JlbWVudCBhbGlhc2VzXG4gKiBjYW4gYmUgdXNlZCB0byBraWNrIG9mZiBhIHRyYW5zaXRpb24gd2hlbiBhIG51bWVyaWMgdmFsdWUgaGFzIGluY3JlYXNlZCBvciBkZWNyZWFzZWQgaW4gdmFsdWUuXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge2dyb3VwLCBhbmltYXRlLCBxdWVyeSwgdHJhbnNpdGlvbiwgc3R5bGUsIHRyaWdnZXJ9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2Jhbm5lci1jYXJvdXNlbC1jb21wb25lbnQnLFxuICogICBzdHlsZXM6IFtgXG4gKiAgICAgLmJhbm5lci1jb250YWluZXIge1xuICogICAgICAgIHBvc2l0aW9uOnJlbGF0aXZlO1xuICogICAgICAgIGhlaWdodDo1MDBweDtcbiAqICAgICAgICBvdmVyZmxvdzpoaWRkZW47XG4gKiAgICAgIH1cbiAqICAgICAuYmFubmVyLWNvbnRhaW5lciA+IC5iYW5uZXIge1xuICogICAgICAgIHBvc2l0aW9uOmFic29sdXRlO1xuICogICAgICAgIGxlZnQ6MDtcbiAqICAgICAgICB0b3A6MDtcbiAqICAgICAgICBmb250LXNpemU6MjAwcHg7XG4gKiAgICAgICAgbGluZS1oZWlnaHQ6NTAwcHg7XG4gKiAgICAgICAgZm9udC13ZWlnaHQ6Ym9sZDtcbiAqICAgICAgICB0ZXh0LWFsaWduOmNlbnRlcjtcbiAqICAgICAgICB3aWR0aDoxMDAlO1xuICogICAgICB9XG4gKiAgIGBdLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxidXR0b24gKGNsaWNrKT1cInByZXZpb3VzKClcIj5QcmV2aW91czwvYnV0dG9uPlxuICogICAgIDxidXR0b24gKGNsaWNrKT1cIm5leHQoKVwiPk5leHQ8L2J1dHRvbj5cbiAqICAgICA8aHI+XG4gKiAgICAgPGRpdiBbQGJhbm5lckFuaW1hdGlvbl09XCJzZWxlY3RlZEluZGV4XCIgY2xhc3M9XCJiYW5uZXItY29udGFpbmVyXCI+XG4gKiAgICAgICA8ZGl2IGNsYXNzPVwiYmFubmVyXCIgKm5nRm9yPVwibGV0IGJhbm5lciBvZiBiYW5uZXJzXCI+IHt7IGJhbm5lciB9fSA8L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgIHRyaWdnZXIoJ2Jhbm5lckFuaW1hdGlvbicsIFtcbiAqICAgICAgIHRyYW5zaXRpb24oXCI6aW5jcmVtZW50XCIsIGdyb3VwKFtcbiAqICAgICAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSxcbiAqICAgICAgICAgICBhbmltYXRlKCcwLjVzIGVhc2Utb3V0Jywgc3R5bGUoJyonKSlcbiAqICAgICAgICAgXSksXG4gKiAgICAgICAgIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKHsgbGVmdDogJy0xMDAlJyB9KSlcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pKSxcbiAqICAgICAgIHRyYW5zaXRpb24oXCI6ZGVjcmVtZW50XCIsIGdyb3VwKFtcbiAqICAgICAgICAgcXVlcnkoJzplbnRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IGxlZnQ6ICctMTAwJScgfSksXG4gKiAgICAgICAgICAgYW5pbWF0ZSgnMC41cyBlYXNlLW91dCcsIHN0eWxlKCcqJykpXG4gKiAgICAgICAgIF0pLFxuICogICAgICAgICBxdWVyeSgnOmxlYXZlJywgW1xuICogICAgICAgICAgIGFuaW1hdGUoJzAuNXMgZWFzZS1vdXQnLCBzdHlsZSh7IGxlZnQ6ICcxMDAlJyB9KSlcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBCYW5uZXJDYXJvdXNlbENvbXBvbmVudCB7XG4gKiAgIGFsbEJhbm5lcnM6IHN0cmluZ1tdID0gWycxJywgJzInLCAnMycsICc0J107XG4gKiAgIHNlbGVjdGVkSW5kZXg6IG51bWJlciA9IDA7XG4gKlxuICogICBnZXQgYmFubmVycygpIHtcbiAqICAgICAgcmV0dXJuIFt0aGlzLmFsbEJhbm5lcnNbdGhpcy5zZWxlY3RlZEluZGV4XV07XG4gKiAgIH1cbiAqXG4gKiAgIHByZXZpb3VzKCkge1xuICogICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWF4KHRoaXMuc2VsZWN0ZWRJbmRleCAtIDEsIDApO1xuICogICB9XG4gKlxuICogICBuZXh0KCkge1xuICogICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWluKHRoaXMuc2VsZWN0ZWRJbmRleCArIDEsIHRoaXMuYWxsQmFubmVycy5sZW5ndGggLSAxKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICoge0BleGFtcGxlIGNvcmUvYW5pbWF0aW9uL3RzL2RzbC9hbmltYXRpb25fZXhhbXBsZS50cyByZWdpb249J0NvbXBvbmVudCd9XG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2l0aW9uKFxuICAgIHN0YXRlQ2hhbmdlRXhwcjogc3RyaW5nIHwgKChmcm9tU3RhdGU6IHN0cmluZywgdG9TdGF0ZTogc3RyaW5nLCBlbGVtZW50PzogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4gYm9vbGVhbiksXG4gICAgc3RlcHM6IEFuaW1hdGlvbk1ldGFkYXRhIHwgQW5pbWF0aW9uTWV0YWRhdGFbXSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25UcmFuc2l0aW9uTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5UcmFuc2l0aW9uLCBleHByOiBzdGF0ZUNoYW5nZUV4cHIsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBhbmltYXRpb25gIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS5cbiAqXG4gKiBgdmFyIG15QW5pbWF0aW9uID0gYW5pbWF0aW9uKC4uLilgIGlzIGRlc2lnbmVkIHRvIHByb2R1Y2UgYSByZXVzYWJsZSBhbmltYXRpb24gdGhhdCBjYW4gYmUgbGF0ZXJcbiAqIGludm9rZWQgaW4gYW5vdGhlciBhbmltYXRpb24gb3Igc2VxdWVuY2UuIFJldXNhYmxlIGFuaW1hdGlvbnMgYXJlIGRlc2lnbmVkIHRvIG1ha2UgdXNlIG9mXG4gKiBhbmltYXRpb24gcGFyYW1ldGVycyBhbmQgdGhlIHByb2R1Y2VkIGFuaW1hdGlvbiBjYW4gYmUgdXNlZCB2aWEgdGhlIGB1c2VBbmltYXRpb25gIG1ldGhvZC5cbiAqXG4gKiBgYGBcbiAqIHZhciBmYWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uKFtcbiAqICAgc3R5bGUoeyBvcGFjaXR5OiAne3sgc3RhcnQgfX0nIH0pLFxuICogICBhbmltYXRlKCd7eyB0aW1lIH19JyxcbiAqICAgICBzdHlsZSh7IG9wYWNpdHk6ICd7eyBlbmQgfX0nfSkpXG4gKiBdLCB7IHBhcmFtczogeyB0aW1lOiAnMTAwMG1zJywgc3RhcnQ6IDAsIGVuZDogMSB9fSk7XG4gKiBgYGBcbiAqXG4gKiBJZiBwYXJhbWV0ZXJzIGFyZSBhdHRhY2hlZCB0byBhbiBhbmltYXRpb24gdGhlbiB0aGV5IGFjdCBhcyAqKmRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlcyoqLiBXaGVuIGFuXG4gKiBhbmltYXRpb24gaXMgaW52b2tlZCB2aWEgYHVzZUFuaW1hdGlvbmAgdGhlbiBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBhbGxvd2VkIHRvIGJlIHBhc3NlZCBpblxuICogZGlyZWN0bHkuIElmIGFueSBvZiB0aGUgcGFzc2VkIGluIHBhcmFtZXRlciB2YWx1ZXMgYXJlIG1pc3NpbmcgdGhlbiB0aGUgZGVmYXVsdCB2YWx1ZXMgd2lsbCBiZVxuICogdXNlZC5cbiAqXG4gKiBgYGBcbiAqIHVzZUFuaW1hdGlvbihmYWRlQW5pbWF0aW9uLCB7XG4gKiAgIHBhcmFtczoge1xuICogICAgIHRpbWU6ICcycycsXG4gKiAgICAgc3RhcnQ6IDEsXG4gKiAgICAgZW5kOiAwXG4gKiAgIH1cbiAqIH0pXG4gKiBgYGBcbiAqXG4gKiBJZiBvbmUgb3IgbW9yZSBwYXJhbWV0ZXIgdmFsdWVzIGFyZSBtaXNzaW5nIGJlZm9yZSBhbmltYXRlZCB0aGVuIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYW5pbWF0aW9uKFxuICAgIHN0ZXBzOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10sXG4gICAgb3B0aW9uczogQW5pbWF0aW9uT3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uUmVmZXJlbmNlTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5SZWZlcmVuY2UsIGFuaW1hdGlvbjogc3RlcHMsIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBhbmltYXRlQ2hpbGRgIGlzIGFuIGFuaW1hdGlvbi1zcGVjaWZpYyBmdW5jdGlvbiB0aGF0IGlzIGRlc2lnbmVkIHRvIGJlIHVzZWQgaW5zaWRlIG9mIEFuZ3VsYXInc1xuICogYW5pbWF0aW9uIERTTCBsYW5ndWFnZS4gSXQgd29ya3MgYnkgYWxsb3dpbmcgYSBxdWVyaWVkIGVsZW1lbnQgdG8gZXhlY3V0ZSBpdHMgb3duXG4gKiBhbmltYXRpb24gd2l0aGluIHRoZSBhbmltYXRpb24gc2VxdWVuY2UuXG4gKlxuICogRWFjaCB0aW1lIGFuIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgaW4gYW5ndWxhciwgdGhlIHBhcmVudCBhbmltYXRpb25cbiAqIHdpbGwgYWx3YXlzIGdldCBwcmlvcml0eSBhbmQgYW55IGNoaWxkIGFuaW1hdGlvbnMgd2lsbCBiZSBibG9ja2VkLiBJbiBvcmRlclxuICogZm9yIGEgY2hpbGQgYW5pbWF0aW9uIHRvIHJ1biwgdGhlIHBhcmVudCBhbmltYXRpb24gbXVzdCBxdWVyeSBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICogY29udGFpbmluZyBjaGlsZCBhbmltYXRpb25zIGFuZCB0aGVuIGFsbG93IHRoZSBhbmltYXRpb25zIHRvIHJ1biB1c2luZyBgYW5pbWF0ZUNoaWxkYC5cbiAqXG4gKiBUaGUgZXhhbXBsZSBIVE1MIGNvZGUgYmVsb3cgc2hvd3MgYm90aCBwYXJlbnQgYW5kIGNoaWxkIGVsZW1lbnRzIHRoYXQgaGF2ZSBhbmltYXRpb25cbiAqIHRyaWdnZXJzIHRoYXQgd2lsbCBleGVjdXRlIGF0IHRoZSBzYW1lIHRpbWUuXG4gKlxuICogYGBgaHRtbFxuICogPCEtLSBwYXJlbnQtY2hpbGQuY29tcG9uZW50Lmh0bWwgLS0+XG4gKiA8YnV0dG9uIChjbGljayk9XCJleHAgPSEgZXhwXCI+VG9nZ2xlPC9idXR0b24+XG4gKiA8aHI+XG4gKlxuICogPGRpdiBbQHBhcmVudEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgPGhlYWRlcj5IZWxsbzwvaGVhZGVyPlxuICogICA8ZGl2IFtAY2hpbGRBbmltYXRpb25dPVwiZXhwXCI+XG4gKiAgICAgICBvbmVcbiAqICAgPC9kaXY+XG4gKiAgIDxkaXYgW0BjaGlsZEFuaW1hdGlvbl09XCJleHBcIj5cbiAqICAgICAgIHR3b1xuICogICA8L2Rpdj5cbiAqICAgPGRpdiBbQGNoaWxkQW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgdGhyZWVcbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIE5vdyB3aGVuIHRoZSBgZXhwYCB2YWx1ZSBjaGFuZ2VzIHRvIHRydWUsIG9ubHkgdGhlIGBwYXJlbnRBbmltYXRpb25gIGFuaW1hdGlvbiB3aWxsIGFuaW1hdGVcbiAqIGJlY2F1c2UgaXQgaGFzIHByaW9yaXR5LiBIb3dldmVyLCB1c2luZyBgcXVlcnlgIGFuZCBgYW5pbWF0ZUNoaWxkYCBlYWNoIG9mIHRoZSBpbm5lciBhbmltYXRpb25zXG4gKiBjYW4gYWxzbyBmaXJlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBwYXJlbnQtY2hpbGQuY29tcG9uZW50LnRzXG4gKiBpbXBvcnQge3RyaWdnZXIsIHRyYW5zaXRpb24sIGFuaW1hdGUsIHN0eWxlLCBxdWVyeSwgYW5pbWF0ZUNoaWxkfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhcmVudC1jaGlsZC1jb21wb25lbnQnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcigncGFyZW50QW5pbWF0aW9uJywgW1xuICogICAgICAgdHJhbnNpdGlvbignZmFsc2UgPT4gdHJ1ZScsIFtcbiAqICAgICAgICAgcXVlcnkoJ2hlYWRlcicsIFtcbiAqICAgICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICAgICAgYW5pbWF0ZSg1MDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgICAgICAgXSksXG4gKiAgICAgICAgIHF1ZXJ5KCdAY2hpbGRBbmltYXRpb24nLCBbXG4gKiAgICAgICAgICAgYW5pbWF0ZUNoaWxkKClcbiAqICAgICAgICAgXSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSksXG4gKiAgICAgdHJpZ2dlcignY2hpbGRBbmltYXRpb24nLCBbXG4gKiAgICAgICB0cmFuc2l0aW9uKCdmYWxzZSA9PiB0cnVlJywgW1xuICogICAgICAgICBzdHlsZSh7IG9wYWNpdHk6IDAgfSksXG4gKiAgICAgICAgIGFuaW1hdGUoNTAwLCBzdHlsZSh7IG9wYWNpdHk6IDEgfSkpXG4gKiAgICAgICBdKVxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBQYXJlbnRDaGlsZENtcCB7XG4gKiAgIGV4cDogYm9vbGVhbiA9IGZhbHNlO1xuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhlIGFuaW1hdGlvbiBjb2RlIGFib3ZlLCB3aGVuIHRoZSBgcGFyZW50QW5pbWF0aW9uYCB0cmFuc2l0aW9uIGtpY2tzIG9mZiBpdCBmaXJzdCBxdWVyaWVzIHRvXG4gKiBmaW5kIHRoZSBoZWFkZXIgZWxlbWVudCBhbmQgZmFkZXMgaXQgaW4uIEl0IHRoZW4gZmluZHMgZWFjaCBvZiB0aGUgc3ViIGVsZW1lbnRzIHRoYXQgY29udGFpbiB0aGVcbiAqIGBAY2hpbGRBbmltYXRpb25gIHRyaWdnZXIgYW5kIHRoZW4gYWxsb3dzIGZvciB0aGVpciBhbmltYXRpb25zIHRvIGZpcmUuXG4gKlxuICogVGhpcyBleGFtcGxlIGNhbiBiZSBmdXJ0aGVyIGV4dGVuZGVkIGJ5IHVzaW5nIHN0YWdnZXI6XG4gKlxuICogYGBgdHNcbiAqIHF1ZXJ5KCdAY2hpbGRBbmltYXRpb24nLCBzdGFnZ2VyKDEwMCwgW1xuICogICBhbmltYXRlQ2hpbGQoKVxuICogXSkpXG4gKiBgYGBcbiAqXG4gKiBOb3cgZWFjaCBvZiB0aGUgc3ViIGFuaW1hdGlvbnMgc3RhcnQgb2ZmIHdpdGggcmVzcGVjdCB0byB0aGUgYDEwMG1zYCBzdGFnZ2VyaW5nIHN0ZXAuXG4gKlxuICogIyMgVGhlIGZpcnN0IGZyYW1lIG9mIGNoaWxkIGFuaW1hdGlvbnNcbiAqIFdoZW4gc3ViIGFuaW1hdGlvbnMgYXJlIGV4ZWN1dGVkIHVzaW5nIGBhbmltYXRlQ2hpbGRgIHRoZSBhbmltYXRpb24gZW5naW5lIHdpbGwgYWx3YXlzIGFwcGx5IHRoZVxuICogZmlyc3QgZnJhbWUgb2YgZXZlcnkgc3ViIGFuaW1hdGlvbiBpbW1lZGlhdGVseSBhdCB0aGUgc3RhcnQgb2YgdGhlIGFuaW1hdGlvbiBzZXF1ZW5jZS4gVGhpcyB3YXlcbiAqIHRoZSBwYXJlbnQgYW5pbWF0aW9uIGRvZXMgbm90IG5lZWQgdG8gc2V0IGFueSBpbml0aWFsIHN0eWxpbmcgZGF0YSBvbiB0aGUgc3ViIGVsZW1lbnRzIGJlZm9yZSB0aGVcbiAqIHN1YiBhbmltYXRpb25zIGtpY2sgb2ZmLlxuICpcbiAqIEluIHRoZSBleGFtcGxlIGFib3ZlIHRoZSBmaXJzdCBmcmFtZSBvZiB0aGUgYGNoaWxkQW5pbWF0aW9uYCdzIGBmYWxzZSA9PiB0cnVlYCB0cmFuc2l0aW9uXG4gKiBjb25zaXN0cyBvZiBhIHN0eWxlIG9mIGBvcGFjaXR5OiAwYC4gVGhpcyBpcyBhcHBsaWVkIGltbWVkaWF0ZWx5IHdoZW4gdGhlIGBwYXJlbnRBbmltYXRpb25gXG4gKiBhbmltYXRpb24gdHJhbnNpdGlvbiBzZXF1ZW5jZSBzdGFydHMuIE9ubHkgdGhlbiB3aGVuIHRoZSBgQGNoaWxkQW5pbWF0aW9uYCBpcyBxdWVyaWVkIGFuZCBjYWxsZWRcbiAqIHdpdGggYGFuaW1hdGVDaGlsZGAgd2lsbCBpdCB0aGVuIGFuaW1hdGUgdG8gaXRzIGRlc3RpbmF0aW9uIG9mIGBvcGFjaXR5OiAxYC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBmZWF0dXJlIGRlc2lnbmVkIHRvIGJlIHVzZWQgYWxvbmdzaWRlIHtAbGluayBxdWVyeSBxdWVyeSgpfSBhbmQgaXQgd2lsbCBvbmx5IHdvcmtcbiAqIHdpdGggYW5pbWF0aW9ucyB0aGF0IGFyZSBhc3NpZ25lZCB1c2luZyB0aGUgQW5ndWxhciBhbmltYXRpb24gRFNMICh0aGlzIG1lYW5zIHRoYXQgQ1NTIGtleWZyYW1lc1xuICogYW5kIHRyYW5zaXRpb25zIGFyZSBub3QgaGFuZGxlZCBieSB0aGlzIEFQSSkuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmltYXRlQ2hpbGQob3B0aW9uczogQW5pbWF0ZUNoaWxkT3B0aW9ucyB8IG51bGwgPSBudWxsKTpcbiAgICBBbmltYXRpb25BbmltYXRlQ2hpbGRNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLkFuaW1hdGVDaGlsZCwgb3B0aW9uc307XG59XG5cbi8qKlxuICogYHVzZUFuaW1hdGlvbmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJdCBpcyB1c2VkIHRvIGtpY2sgb2ZmIGEgcmV1c2FibGUgYW5pbWF0aW9uIHRoYXQgaXMgY3JlYXRlZCB1c2luZyB7QGxpbmtcbiAqIGFuaW1hdGlvbiBhbmltYXRpb24oKX0uXG4gKlxuICogQGV4cGVyaW1lbnRhbCBBbmltYXRpb24gc3VwcG9ydCBpcyBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VBbmltYXRpb24oXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25SZWZlcmVuY2VNZXRhZGF0YSxcbiAgICBvcHRpb25zOiBBbmltYXRpb25PcHRpb25zIHwgbnVsbCA9IG51bGwpOiBBbmltYXRpb25BbmltYXRlUmVmTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5BbmltYXRlUmVmLCBhbmltYXRpb24sIG9wdGlvbnN9O1xufVxuXG4vKipcbiAqIGBxdWVyeWAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLlxuICpcbiAqIHF1ZXJ5KCkgaXMgdXNlZCB0byBmaW5kIG9uZSBvciBtb3JlIGlubmVyIGVsZW1lbnRzIHdpdGhpbiB0aGUgY3VycmVudCBlbGVtZW50IHRoYXQgaXNcbiAqIGJlaW5nIGFuaW1hdGVkIHdpdGhpbiB0aGUgc2VxdWVuY2UuIFRoZSBwcm92aWRlZCBhbmltYXRpb24gc3RlcHMgYXJlIGFwcGxpZWRcbiAqIHRvIHRoZSBxdWVyaWVkIGVsZW1lbnQgKGJ5IGRlZmF1bHQsIGFuIGFycmF5IGlzIHByb3ZpZGVkLCB0aGVuIHRoaXMgd2lsbCBiZVxuICogdHJlYXRlZCBhcyBhbiBhbmltYXRpb24gc2VxdWVuY2UpLlxuICpcbiAqICMjIyBVc2FnZVxuICpcbiAqIHF1ZXJ5KCkgaXMgZGVzaWduZWQgdG8gY29sbGVjdCBtdWx0aXBsZSBlbGVtZW50cyBhbmQgd29ya3MgaW50ZXJuYWxseSBieSB1c2luZ1xuICogYGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbGAuIEFuIGFkZGl0aW9uYWwgb3B0aW9ucyBvYmplY3QgY2FuIGJlIHByb3ZpZGVkIHdoaWNoXG4gKiBjYW4gYmUgdXNlZCB0byBsaW1pdCB0aGUgdG90YWwgYW1vdW50IG9mIGl0ZW1zIHRvIGJlIGNvbGxlY3RlZC5cbiAqXG4gKiBgYGBqc1xuICogcXVlcnkoJ2RpdicsIFtcbiAqICAgYW5pbWF0ZSguLi4pLFxuICogICBhbmltYXRlKC4uLilcbiAqIF0sIHsgbGltaXQ6IDEgfSlcbiAqIGBgYFxuICpcbiAqIHF1ZXJ5KCksIGJ5IGRlZmF1bHQsIHdpbGwgdGhyb3cgYW4gZXJyb3Igd2hlbiB6ZXJvIGl0ZW1zIGFyZSBmb3VuZC4gSWYgYSBxdWVyeVxuICogaGFzIHRoZSBgb3B0aW9uYWxgIGZsYWcgc2V0IHRvIHRydWUgdGhlbiB0aGlzIGVycm9yIHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBgYGBqc1xuICogcXVlcnkoJy5zb21lLWVsZW1lbnQtdGhhdC1tYXktbm90LWJlLXRoZXJlJywgW1xuICogICBhbmltYXRlKC4uLiksXG4gKiAgIGFuaW1hdGUoLi4uKVxuICogXSwgeyBvcHRpb25hbDogdHJ1ZSB9KVxuICogYGBgXG4gKlxuICogIyMjIFNwZWNpYWwgU2VsZWN0b3IgVmFsdWVzXG4gKlxuICogVGhlIHNlbGVjdG9yIHZhbHVlIHdpdGhpbiBhIHF1ZXJ5IGNhbiBjb2xsZWN0IGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbmd1bGFyLXNwZWNpZmljXG4gKiBjaGFyYWN0ZXJpc3RpY3NcbiAqIHVzaW5nIHNwZWNpYWwgcHNldWRvLXNlbGVjdG9ycyB0b2tlbnMuXG4gKlxuICogVGhlc2UgaW5jbHVkZTpcbiAqXG4gKiAgLSBRdWVyeWluZyBmb3IgbmV3bHkgaW5zZXJ0ZWQvcmVtb3ZlZCBlbGVtZW50cyB1c2luZyBgcXVlcnkoXCI6ZW50ZXJcIilgL2BxdWVyeShcIjpsZWF2ZVwiKWBcbiAqICAtIFF1ZXJ5aW5nIGFsbCBjdXJyZW50bHkgYW5pbWF0aW5nIGVsZW1lbnRzIHVzaW5nIGBxdWVyeShcIjphbmltYXRpbmdcIilgXG4gKiAgLSBRdWVyeWluZyBlbGVtZW50cyB0aGF0IGNvbnRhaW4gYW4gYW5pbWF0aW9uIHRyaWdnZXIgdXNpbmcgYHF1ZXJ5KFwiQHRyaWdnZXJOYW1lXCIpYFxuICogIC0gUXVlcnlpbmcgYWxsIGVsZW1lbnRzIHRoYXQgY29udGFpbiBhbiBhbmltYXRpb24gdHJpZ2dlcnMgdXNpbmcgYHF1ZXJ5KFwiQCpcIilgXG4gKiAgLSBJbmNsdWRpbmcgdGhlIGN1cnJlbnQgZWxlbWVudCBpbnRvIHRoZSBhbmltYXRpb24gc2VxdWVuY2UgdXNpbmcgYHF1ZXJ5KFwiOnNlbGZcIilgXG4gKlxuICpcbiAqICBFYWNoIG9mIHRoZXNlIHBzZXVkby1zZWxlY3RvciB0b2tlbnMgY2FuIGJlIG1lcmdlZCB0b2dldGhlciBpbnRvIGEgY29tYmluZWQgcXVlcnkgc2VsZWN0b3JcbiAqIHN0cmluZzpcbiAqXG4gKiAgYGBgXG4gKiAgcXVlcnkoJzpzZWxmLCAucmVjb3JkOmVudGVyLCAucmVjb3JkOmxlYXZlLCBAc3ViVHJpZ2dlcicsIFsuLi5dKVxuICogIGBgYFxuICpcbiAqICMjIyBEZW1vXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdpbm5lcicsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGRpdiBbQHF1ZXJ5QW5pbWF0aW9uXT1cImV4cFwiPlxuICogICAgICAgPGgxPlRpdGxlPC9oMT5cbiAqICAgICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gKiAgICAgICAgIEJsYWggYmxhaCBibGFoXG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgYCxcbiAqICAgYW5pbWF0aW9uczogW1xuICogICAgdHJpZ2dlcigncXVlcnlBbmltYXRpb24nLCBbXG4gKiAgICAgIHRyYW5zaXRpb24oJyogPT4gZ29BbmltYXRlJywgW1xuICogICAgICAgIC8vIGhpZGUgdGhlIGlubmVyIGVsZW1lbnRzXG4gKiAgICAgICAgcXVlcnkoJ2gxJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKSxcbiAqICAgICAgICBxdWVyeSgnLmNvbnRlbnQnLCBzdHlsZSh7IG9wYWNpdHk6IDAgfSkpLFxuICpcbiAqICAgICAgICAvLyBhbmltYXRlIHRoZSBpbm5lciBlbGVtZW50cyBpbiwgb25lIGJ5IG9uZVxuICogICAgICAgIHF1ZXJ5KCdoMScsIGFuaW1hdGUoMTAwMCwgc3R5bGUoeyBvcGFjaXR5OiAxIH0pKSxcbiAqICAgICAgICBxdWVyeSgnLmNvbnRlbnQnLCBhbmltYXRlKDEwMDAsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSksXG4gKiAgICAgIF0pXG4gKiAgICBdKVxuICogIF1cbiAqIH0pXG4gKiBjbGFzcyBDbXAge1xuICogICBleHAgPSAnJztcbiAqXG4gKiAgIGdvQW5pbWF0ZSgpIHtcbiAqICAgICB0aGlzLmV4cCA9ICdnb0FuaW1hdGUnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAZXhwZXJpbWVudGFsIEFuaW1hdGlvbiBzdXBwb3J0IGlzIGV4cGVyaW1lbnRhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHF1ZXJ5KFxuICAgIHNlbGVjdG9yOiBzdHJpbmcsIGFuaW1hdGlvbjogQW5pbWF0aW9uTWV0YWRhdGEgfCBBbmltYXRpb25NZXRhZGF0YVtdLFxuICAgIG9wdGlvbnM6IEFuaW1hdGlvblF1ZXJ5T3B0aW9ucyB8IG51bGwgPSBudWxsKTogQW5pbWF0aW9uUXVlcnlNZXRhZGF0YSB7XG4gIHJldHVybiB7dHlwZTogQW5pbWF0aW9uTWV0YWRhdGFUeXBlLlF1ZXJ5LCBzZWxlY3RvciwgYW5pbWF0aW9uLCBvcHRpb25zfTtcbn1cblxuLyoqXG4gKiBgc3RhZ2dlcmAgaXMgYW4gYW5pbWF0aW9uLXNwZWNpZmljIGZ1bmN0aW9uIHRoYXQgaXMgZGVzaWduZWQgdG8gYmUgdXNlZCBpbnNpZGUgb2YgQW5ndWxhcidzXG4gKiBhbmltYXRpb24gRFNMIGxhbmd1YWdlLiBJdCBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIGluc2lkZSBvZiBhbiBhbmltYXRpb24ge0BsaW5rIHF1ZXJ5IHF1ZXJ5KCl9XG4gKiBhbmQgd29ya3MgYnkgaXNzdWluZyBhIHRpbWluZyBnYXAgYmV0d2VlbiBhZnRlciBlYWNoIHF1ZXJpZWQgaXRlbSBpcyBhbmltYXRlZC5cbiAqXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBJbiB0aGUgZXhhbXBsZSBiZWxvdyB0aGVyZSBpcyBhIGNvbnRhaW5lciBlbGVtZW50IHRoYXQgd3JhcHMgYSBsaXN0IG9mIGl0ZW1zIHN0YW1wZWQgb3V0XG4gKiBieSBhbiBuZ0Zvci4gVGhlIGNvbnRhaW5lciBlbGVtZW50IGNvbnRhaW5zIGFuIGFuaW1hdGlvbiB0cmlnZ2VyIHRoYXQgd2lsbCBsYXRlciBiZSBzZXRcbiAqIHRvIHF1ZXJ5IGZvciBlYWNoIG9mIHRoZSBpbm5lciBpdGVtcy5cbiAqXG4gKiBgYGBodG1sXG4gKiA8IS0tIGxpc3QuY29tcG9uZW50Lmh0bWwgLS0+XG4gKiA8YnV0dG9uIChjbGljayk9XCJ0b2dnbGUoKVwiPlNob3cgLyBIaWRlIEl0ZW1zPC9idXR0b24+XG4gKiA8aHIgLz5cbiAqIDxkaXYgW0BsaXN0QW5pbWF0aW9uXT1cIml0ZW1zLmxlbmd0aFwiPlxuICogICA8ZGl2ICpuZ0Zvcj1cImxldCBpdGVtIG9mIGl0ZW1zXCI+XG4gKiAgICAge3sgaXRlbSB9fVxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogVGhlIGNvbXBvbmVudCBjb2RlIGZvciB0aGlzIGxvb2tzIGFzIHN1Y2g6XG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7dHJpZ2dlciwgdHJhbnNpdGlvbiwgc3R5bGUsIGFuaW1hdGUsIHF1ZXJ5LCBzdGFnZ2VyfSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcbiAqIEBDb21wb25lbnQoe1xuICogICB0ZW1wbGF0ZVVybDogJ2xpc3QuY29tcG9uZW50Lmh0bWwnLFxuICogICBhbmltYXRpb25zOiBbXG4gKiAgICAgdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgICAgICAvLy4uLlxuICogICAgIF0pXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBMaXN0Q29tcG9uZW50IHtcbiAqICAgaXRlbXMgPSBbXTtcbiAqXG4gKiAgIHNob3dJdGVtcygpIHtcbiAqICAgICB0aGlzLml0ZW1zID0gWzAsMSwyLDMsNF07XG4gKiAgIH1cbiAqXG4gKiAgIGhpZGVJdGVtcygpIHtcbiAqICAgICB0aGlzLml0ZW1zID0gW107XG4gKiAgIH1cbiAqXG4gKiAgIHRvZ2dsZSgpIHtcbiAqICAgICB0aGlzLml0ZW1zLmxlbmd0aCA/IHRoaXMuaGlkZUl0ZW1zKCkgOiB0aGlzLnNob3dJdGVtcygpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBbmQgbm93IGZvciB0aGUgYW5pbWF0aW9uIHRyaWdnZXIgY29kZTpcbiAqXG4gKiBgYGB0c1xuICogdHJpZ2dlcignbGlzdEFuaW1hdGlvbicsIFtcbiAqICAgdHJhbnNpdGlvbignKiA9PiAqJywgWyAvLyBlYWNoIHRpbWUgdGhlIGJpbmRpbmcgdmFsdWUgY2hhbmdlc1xuICogICAgIHF1ZXJ5KCc6bGVhdmUnLCBbXG4gKiAgICAgICBzdGFnZ2VyKDEwMCwgW1xuICogICAgICAgICBhbmltYXRlKCcwLjVzJywgc3R5bGUoeyBvcGFjaXR5OiAwIH0pKVxuICogICAgICAgXSlcbiAqICAgICBdKSxcbiAqICAgICBxdWVyeSgnOmVudGVyJywgW1xuICogICAgICAgc3R5bGUoeyBvcGFjaXR5OiAwIH0pLFxuICogICAgICAgc3RhZ2dlcigxMDAsIFtcbiAqICAgICAgICAgYW5pbWF0ZSgnMC41cycsIHN0eWxlKHsgb3BhY2l0eTogMSB9KSlcbiAqICAgICAgIF0pXG4gKiAgICAgXSlcbiAqICAgXSlcbiAqIF0pXG4gKiBgYGBcbiAqXG4gKiBOb3cgZWFjaCB0aW1lIHRoZSBpdGVtcyBhcmUgYWRkZWQvcmVtb3ZlZCB0aGVuIGVpdGhlciB0aGUgb3BhY2l0eVxuICogZmFkZS1pbiBhbmltYXRpb24gd2lsbCBydW4gb3IgZWFjaCByZW1vdmVkIGl0ZW0gd2lsbCBiZSBmYWRlZCBvdXQuXG4gKiBXaGVuIGVpdGhlciBvZiB0aGVzZSBhbmltYXRpb25zIG9jY3VyIHRoZW4gYSBzdGFnZ2VyIGVmZmVjdCB3aWxsIGJlXG4gKiBhcHBsaWVkIGFmdGVyIGVhY2ggaXRlbSdzIGFuaW1hdGlvbiBpcyBzdGFydGVkLlxuICpcbiAqIEBleHBlcmltZW50YWwgQW5pbWF0aW9uIHN1cHBvcnQgaXMgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RhZ2dlcihcbiAgICB0aW1pbmdzOiBzdHJpbmcgfCBudW1iZXIsXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb25NZXRhZGF0YSB8IEFuaW1hdGlvbk1ldGFkYXRhW10pOiBBbmltYXRpb25TdGFnZ2VyTWV0YWRhdGEge1xuICByZXR1cm4ge3R5cGU6IEFuaW1hdGlvbk1ldGFkYXRhVHlwZS5TdGFnZ2VyLCB0aW1pbmdzLCBhbmltYXRpb259O1xufVxuIl19