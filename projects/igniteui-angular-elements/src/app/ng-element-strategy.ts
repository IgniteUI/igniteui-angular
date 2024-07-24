/**
 * COPIED from @angular/elements with some modified imports/content to contain code within a single file:
 *
 * Copyright (c) 2010-2022 Google LLC. http://angular.io/license
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  ApplicationRef,
  ChangeDetectorRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Injector,
  NgZone,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  Type,
} from '@angular/core';
import {merge, Observable, ReplaySubject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {
  NgElementStrategy,
  NgElementStrategyEvent,
  NgElementStrategyFactory,
} from '@angular/elements';
// import {extractProjectableNodes} from './extract-projectable-nodes';
// import {isFunction, scheduler, strictEquals} from './utils';

/** Time in milliseconds to wait before destroying the component ref when disconnected. */
const DESTROY_DELAY = 10;

/**
 * Factory that creates new ComponentNgElementStrategy instance. Gets the component factory with the
 * constructor's injector's factory resolver and passes that factory to each strategy.
 */
export class ComponentNgElementStrategyFactory implements NgElementStrategyFactory {
  componentFactory: ComponentFactory<any>;

  constructor(component: Type<any>, injector: Injector) {
    this.componentFactory = injector
      .get(ComponentFactoryResolver)
      .resolveComponentFactory(component);
  }

  create(injector: Injector) {
    return new ComponentNgElementStrategy(this.componentFactory, injector);
  }
}

/**
 * Creates and destroys a component ref using a component factory and handles change detection
 * in response to input changes.
 */
export class ComponentNgElementStrategy implements NgElementStrategy {
  // Subject of `NgElementStrategyEvent` observables corresponding to the component's outputs.
  private eventEmitters = new ReplaySubject<Observable<NgElementStrategyEvent>[]>(1);

  /** Merged stream of the component's output events. */
  readonly events = this.eventEmitters.pipe(switchMap((emitters) => merge(...emitters)));

  /** Reference to the component that was created on connect. */
  private componentRef: ComponentRef<any> | null = null;

  /** Reference to the component view's `ChangeDetectorRef`. */
  private viewChangeDetectorRef: ChangeDetectorRef | null = null;

  /**
   * Changes that have been made to component inputs since the last change detection run.
   * (NOTE: These are only recorded if the component implements the `OnChanges` interface.)
   */
  private inputChanges: SimpleChanges | null = null;

  /** Whether changes have been made to component inputs since the last change detection run. */
  private hasInputChanges = false;

  /** Whether the created component implements the `OnChanges` interface. */
  private implementsOnChanges = false;

  /** Whether a change detection has been scheduled to run on the component. */
  private scheduledChangeDetectionFn: (() => void) | null = null;

  /** Callback function that when called will cancel a scheduled destruction on the component. */
  private scheduledDestroyFn: (() => void) | null = null;

  /** Initial input values that were set before the component was created. */
  private readonly initialInputValues = new Map<string, any>();

  /**
   * Set of component inputs that have not yet changed, i.e. for which `recordInputChange()` has not
   * fired.
   * (This helps detect the first change of an input, even if it is explicitly set to `undefined`.)
   */
  private readonly unchangedInputs: Set<string>;

  /** Service for setting zone context. */
  private readonly ngZone: NgZone;

  /** The zone the element was created in or `null` if Zone.js is not loaded. */
  private readonly elementZone: Zone | null;

  constructor(
    private componentFactory: ComponentFactory<any>,
    private injector: Injector,
  ) {
    this.unchangedInputs = new Set<string>(
      this.componentFactory.inputs.map(({propName}) => propName),
    );
    this.ngZone = this.injector.get<NgZone>(NgZone);
    this.elementZone = typeof Zone === 'undefined' ? null : this.ngZone.run(() => Zone.current);
  }

  /**
   * Initializes a new component if one has not yet been created and cancels any scheduled
   * destruction.
   */
  connect(element: HTMLElement) {
    this.runInZone(() => {
      // If the element is marked to be destroyed, cancel the task since the component was
      // reconnected
      if (this.scheduledDestroyFn !== null) {
        this.scheduledDestroyFn();
        this.scheduledDestroyFn = null;
        return;
      }

      if (this.componentRef === null) {
        this.initializeComponent(element);
      }
    });
  }

  /**
   * Schedules the component to be destroyed after some small delay in case the element is just
   * being moved across the DOM.
   */
  disconnect() {
    this.runInZone(() => {
      // Return if there is no componentRef or the component is already scheduled for destruction
      if (this.componentRef === null || this.scheduledDestroyFn !== null) {
        return;
      }

      // Schedule the component to be destroyed after a small timeout in case it is being
      // moved elsewhere in the DOM
      this.scheduledDestroyFn = scheduler.schedule(() => {
        if (this.componentRef !== null) {
          this.componentRef.destroy();
          this.componentRef = null;
          this.viewChangeDetectorRef = null;
        }
      }, DESTROY_DELAY);
    });
  }

  /**
   * Returns the component property value. If the component has not yet been created, the value is
   * retrieved from the cached initialization values.
   */
  getInputValue(property: string): any {
    return this.runInZone(() => {
      if (this.componentRef === null) {
        return this.initialInputValues.get(property);
      }

      return this.componentRef.instance[property];
    });
  }

  /**
   * Sets the input value for the property. If the component has not yet been created, the value is
   * cached and set when the component is created.
   */
  setInputValue(property: string, value: any, transform?: (value: any) => any): void {
    this.runInZone(() => {
      if (transform) {
        value = transform.call(this.componentRef?.instance, value);
      }

      if (this.componentRef === null || !this.componentRef.instance) {
        this.initialInputValues.set(property, value);
        return;
      }

      // Ignore the value if it is strictly equal to the current value, except if it is `undefined`
      // and this is the first change to the value (because an explicit `undefined` _is_ strictly
      // equal to not having a value set at all, but we still need to record this as a change).
      if (
        strictEquals(value, this.getInputValue(property)) &&
        !(value === undefined && this.unchangedInputs.has(property))
      ) {
        return;
      }

      // Record the changed value and update internal state to reflect the fact that this input has
      // changed.
      this.recordInputChange(property, value);
      this.unchangedInputs.delete(property);
      this.hasInputChanges = true;

      // Update the component instance and schedule change detection.
      this.componentRef.instance[property] = value;
      this.scheduleDetectChanges();
    });
  }

  /**
   * Creates a new component through the component factory with the provided element host and
   * sets up its initial inputs, listens for outputs changes, and runs an initial change detection.
   */
  protected initializeComponent(element: HTMLElement) {
    const childInjector = Injector.create({providers: [], parent: this.injector});
    const projectableNodes = extractProjectableNodes(
      element,
      this.componentFactory.ngContentSelectors,
    );
    this.componentRef = this.componentFactory.create(childInjector, projectableNodes, element);
    this.viewChangeDetectorRef = this.componentRef.injector.get(ChangeDetectorRef);

    this.implementsOnChanges = isFunction((this.componentRef.instance as OnChanges).ngOnChanges);

    this.initializeInputs();
    this.initializeOutputs(this.componentRef);

    this.detectChanges();

    const applicationRef = this.injector.get<ApplicationRef>(ApplicationRef);
    applicationRef.attachView(this.componentRef.hostView);
  }

  /** Set any stored initial inputs on the component's properties. */
  protected initializeInputs(): void {
    this.componentFactory.inputs.forEach(({propName, transform}) => {
      if (this.initialInputValues.has(propName)) {
        // Call `setInputValue()` now that the component has been instantiated to update its
        // properties and fire `ngOnChanges()`.
        this.setInputValue(propName, this.initialInputValues.get(propName), transform);
      }
    });

    this.initialInputValues.clear();
  }

  /** Sets up listeners for the component's outputs so that the events stream emits the events. */
  protected initializeOutputs(componentRef: ComponentRef<any>): void {
    const eventEmitters: Observable<NgElementStrategyEvent>[] = this.componentFactory.outputs.map(
      ({propName, templateName}) => {
        const emitter: EventEmitter<any> = componentRef.instance[propName];
        return emitter.pipe(map((value) => ({name: templateName, value})));
      },
    );

    this.eventEmitters.next(eventEmitters);
  }
  /** Calls ngOnChanges with all the inputs that have changed since the last call. */
  protected callNgOnChanges(componentRef: ComponentRef<any>): void {
    if (!this.implementsOnChanges || this.inputChanges === null) {
      return;
    }

    // Cache the changes and set inputChanges to null to capture any changes that might occur
    // during ngOnChanges.
    const inputChanges = this.inputChanges;
    this.inputChanges = null;
    (componentRef.instance as OnChanges).ngOnChanges(inputChanges);
  }

  /**
   * Marks the component view for check, if necessary.
   * (NOTE: This is required when the `ChangeDetectionStrategy` is set to `OnPush`.)
   */
  protected markViewForCheck(viewChangeDetectorRef: ChangeDetectorRef): void {
    if (this.hasInputChanges) {
      this.hasInputChanges = false;
      viewChangeDetectorRef.markForCheck();
    }
  }

  /**
   * Schedules change detection to run on the component.
   * Ignores subsequent calls if already scheduled.
   */
  protected scheduleDetectChanges(): void {
    if (this.scheduledChangeDetectionFn) {
      return;
    }

    this.scheduledChangeDetectionFn = scheduler.scheduleBeforeRender(() => {
      this.scheduledChangeDetectionFn = null;
      this.detectChanges();
    });
  }

  /**
   * Records input changes so that the component receives SimpleChanges in its onChanges function.
   */
  protected recordInputChange(property: string, currentValue: any): void {
    // Do not record the change if the component does not implement `OnChanges`.
    if (!this.implementsOnChanges) {
      return;
    }

    if (this.inputChanges === null) {
      this.inputChanges = {};
    }

    // If there already is a change, modify the current value to match but leave the values for
    // `previousValue` and `isFirstChange`.
    const pendingChange = this.inputChanges[property];
    if (pendingChange) {
      pendingChange.currentValue = currentValue;
      return;
    }

    const isFirstChange = this.unchangedInputs.has(property);
    const previousValue = isFirstChange ? undefined : this.getInputValue(property);
    this.inputChanges[property] = new SimpleChange(previousValue, currentValue, isFirstChange);
  }

  /** Runs change detection on the component. */
  protected detectChanges(): void {
    if (this.componentRef === null) {
      return;
    }

    this.callNgOnChanges(this.componentRef);
    this.markViewForCheck(this.viewChangeDetectorRef!);
    this.componentRef.changeDetectorRef.detectChanges();
  }

  /** Runs in the angular zone, if present. */
  private runInZone(fn: () => unknown) {
    return this.elementZone && Zone.current !== this.elementZone ? this.ngZone.run(fn) : fn();
  }
}


// -----------------
// COPIED from @angular/elements util & co:
// -----------------

/**
 * Provide methods for scheduling the execution of a callback.
 */
const scheduler = {
  /**
   * Schedule a callback to be called after some delay.
   *
   * Returns a function that when executed will cancel the scheduled function.
   */
  schedule(taskFn: () => void, delay: number): () => void {
    const id = setTimeout(taskFn, delay);
    return () => clearTimeout(id);
  },

  /**
   * Schedule a callback to be called before the next render.
   * (If `window.requestAnimationFrame()` is not available, use `scheduler.schedule()` instead.)
   *
   * Returns a function that when executed will cancel the scheduled function.
   */
  scheduleBeforeRender(taskFn: () => void): () => void {
    // TODO(gkalpak): Implement a better way of accessing `requestAnimationFrame()`
    //                (e.g. accounting for vendor prefix, SSR-compatibility, etc).
    if (typeof window === 'undefined') {
      // For SSR just schedule immediately.
      return scheduler.schedule(taskFn, 0);
    }

    if (typeof window.requestAnimationFrame === 'undefined') {
      const frameMs = 16;
      return scheduler.schedule(taskFn, frameMs);
    }

    const id = window.requestAnimationFrame(taskFn);
    return () => window.cancelAnimationFrame(id);
  },
};

/**
 * Check whether the input is a function.
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(value1: any, value2: any): boolean {
  return value1 === value2 || (value1 !== value1 && value2 !== value2);
}

export function extractProjectableNodes(host: HTMLElement, ngContentSelectors: string[]): Node[][] {
  const nodes = host.childNodes;
  const projectableNodes: Node[][] = ngContentSelectors.map(() => []);
  let wildcardIndex = -1;

  ngContentSelectors.some((selector, i) => {
    if (selector === '*') {
      wildcardIndex = i;
      return true;
    }
    return false;
  });

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const node = nodes[i];
    const ngContentIndex = findMatchingIndex(node, ngContentSelectors, wildcardIndex);

    if (ngContentIndex !== -1) {
      projectableNodes[ngContentIndex].push(node);
    }
  }

  return projectableNodes;
}

function findMatchingIndex(node: Node, selectors: string[], defaultIndex: number): number {
  let matchingIndex = defaultIndex;

  if (isElement(node)) {
    selectors.some((selector, i) => {
      if (selector !== '*' && matchesSelector(node, selector)) {
        matchingIndex = i;
        return true;
      }
      return false;
    });
  }

  return matchingIndex;
}

/**
 * Check whether the input is an `Element`.
 */
function isElement(node: Node | null): node is Element {
  return !!node && node.nodeType === Node.ELEMENT_NODE;
}

let _matches: (this: any, selector: string) => boolean;

/**
 * Check whether an `Element` matches a CSS selector.
 * NOTE: this is duplicated from @angular/upgrade, and can
 * be consolidated in the future
 */
function matchesSelector(el: any, selector: string): boolean {
  if (!_matches) {
    const elProto = <any>Element.prototype;
    _matches =
      elProto.matches ||
      elProto.matchesSelector ||
      elProto.mozMatchesSelector ||
      elProto.msMatchesSelector ||
      elProto.oMatchesSelector ||
      elProto.webkitMatchesSelector;
  }
  return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
