import {
    ChangeDetectorRef,
    DestroyRef,
    DOCUMENT,
    ElementRef,
    Injectable,
    NgZone,
    PLATFORM_ID,
    inject,
    isDevMode
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { enterKey, spaceBar } from './keys';

//#region Modifiers and combination keys

/**
 * Each modifier and the `KeyboardEvent` property it reads. A combination key
 * keeps this alphabetical order.
 */
const MODIFIER_ENTRIES = [
    ['alt', 'altKey'],
    ['control', 'ctrlKey'],
    ['meta', 'metaKey'],
    ['shift', 'shiftKey']
] as const satisfies ReadonlyArray<readonly [string, keyof KeyboardEvent]>;

const MODIFIER_NAMES: readonly string[] = MODIFIER_ENTRIES.map(([name]) => name);
const MODIFIERS = new Set<string>(MODIFIER_NAMES);

/** Splits the keys into modifiers and normal keys, in lower case. */
function parseKeys(input: string | string[]): { keys: string[]; modifiers: string[] } {
    const keys: string[] = [];
    const modifiers: string[] = [];

    for (const key of Array.isArray(input) ? input : [input]) {
        const name = key.toLowerCase();
        (MODIFIERS.has(name) ? modifiers : keys).push(name);
    }

    return { keys, modifiers };
}

/** Sorts `modifiers` alphabetically. */
function sortModifiers(modifiers: string[]): string[] {
    return MODIFIER_NAMES.filter((name) => modifiers.includes(name));
}

/**
 * Returns the modifiers active for `event`, already sorted. A modifier is not
 * flagged on its own keyup, so `released` adds it.
 */
function getActiveModifiers(event: KeyboardEvent, released?: string): string[] {
    return MODIFIER_ENTRIES
        .filter(([name, property]) => event[property] || name === released)
        .map(([name]) => name);
}

function hasModifiers(event: KeyboardEvent): boolean {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Joins keys and modifiers into a `+` separated combination key, sorted
 * alphabetically. `modifiers` must already be sorted.
 */
function createCombinationKey(keys: string[], modifiers: string[]): string {
    return modifiers.concat(keys.length > 1 ? [...keys].sort() : keys).join('+');
}

//#endregion

//#region Types

/**
 * The handler of a key binding.
 *
 * @hidden @internal
 */
export type IgxKeyBindingHandler = (event: KeyboardEvent) => void;

/**
 * Whether the service must ignore the event. `target` is the event target.
 *
 * @hidden @internal
 */
export type IgxKeyBindingSkipCallback = (target: Element, event: KeyboardEvent) => boolean;

/**
 * The event type that runs the bound handler.
 *
 * @hidden @internal
 */
export type IgxKeyBindingTrigger = 'keydown' | 'keyup';

/**
 * The options of a single key binding.
 *
 * @hidden @internal
 */
export interface IgxKeyBindingOptions {
    /** The event types that run the handler. Defaults to `['keydown']`. */
    triggers?: IgxKeyBindingTrigger[];
    /**
     * Whether the handler runs for a repeated keydown. Defaults to `false`.
     */
    repeat?: boolean;
    /** Whether to call `preventDefault` before the handler runs. Defaults to `true`. */
    preventDefault?: boolean;
    /** Whether to call `stopPropagation` before the handler runs. Defaults to `false`. */
    stopPropagation?: boolean;
}

/**
 * The configuration of an {@link IgxKeyBindingsService}.
 *
 * @hidden @internal
 */
export interface IgxKeyBindingsConfig {
    /**
     * The key presses that the service ignores. CSS selectors match against
     * the composed path of the event, from the target up to the element that
     * caught it; a {@link IgxKeyBindingSkipCallback} decides per event instead
     * of the selectors. Defaults to `['input', 'textarea', 'select']`.
     */
    skip?: string[] | IgxKeyBindingSkipCallback;
    /** The default options of every binding. The options of a binding take precedence. */
    bindingDefaults?: IgxKeyBindingOptions;
}

/**
 * Stops the keyboard handling of an element observed with
 * {@link IgxKeyBindingsService.observeElement}.
 *
 * @hidden @internal
 */
export interface IgxKeyBindingObserver {
    unsubscribe(): void;
}

/** A registered binding. The key of the binding map holds the combination. */
interface KeyBinding {
    handler: IgxKeyBindingHandler;
    options?: IgxKeyBindingOptions;
}

//#endregion

const DEFAULT_SKIP = ['input', 'textarea', 'select'];
const DEFAULT_BINDING_OPTIONS: IgxKeyBindingOptions = { preventDefault: true };
const DEFAULT_TRIGGERS: IgxKeyBindingTrigger[] = ['keydown'];

function isKeyup(event: Event): boolean {
    return event.type === 'keyup';
}

function isElement(node: EventTarget): node is Element {
    return (node as Node).nodeType === Node.ELEMENT_NODE;
}

/** The host element, which only exists when an element provides the service. */
function injectHost(): HTMLElement {
    const host = inject<ElementRef<HTMLElement>>(ElementRef, { optional: true });
    if (!host) {
        throw new Error(
            'IgxKeyBindingsService has no host element. ' +
            'List it in the providers of the component or directive that uses it.'
        );
    }
    return host.nativeElement;
}

/**
 * Manages the key bindings of the element of the component or directive that
 * provides it.
 *
 * @remarks
 * List it in the `providers` of the component or directive and `inject()` it.
 * The owners on one element share one instance, so only one of them may call
 * {@link configure}. A child element that injects it without providing it gets
 * the instance of its closest ancestor. Use {@link observeElement} for
 * elements outside the view, such as overlay content.
 *
 * @hidden @internal
 */
@Injectable()
export class IgxKeyBindingsService {
    private readonly _host = injectHost();
    private readonly _zone = inject(NgZone);
    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _document = inject(DOCUMENT);
    private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private readonly _destroyRef = inject(DestroyRef);

    private readonly _bindings = new Map<string, KeyBinding>();
    private readonly _allowedKeys = new Set<string>();
    private readonly _pressedKeys = new Set<string>();
    /** Events already handled, for an observed element inside the host. */
    private readonly _handledEvents = new WeakSet<Event>();
    /** One controller for the host and window listeners, one per observed element. */
    private readonly _listeners = new Set<AbortController>();

    private _configured = false;
    private _bindingDefaults = DEFAULT_BINDING_OPTIONS;
    private _skipSelector?: string = DEFAULT_SKIP.join(',');
    private _skipCallback?: IgxKeyBindingSkipCallback;

    constructor() {
        this._destroyRef.onDestroy(() => {
            for (const controller of this._listeners) {
                controller.abort();
            }
            this._listeners.clear();
        });

        if (!this._isBrowser) {
            return;
        }

        const { signal } = this._createListeners();
        this._zone.runOutsideAngular(() => {
            this._listen(this._host, signal);
            // No keyup arrives when focus leaves the host or the window with a key down.
            this._host.addEventListener('focusout', this._onHostFocusOut, { signal });
            this._document.defaultView?.addEventListener('blur', this._releasePressedKeys, { signal });
        });
    }

    //#region Public API

    /**
     * Configures the service. Call it once, before or after the bindings.
     *
     * @remarks
     * The owners on one element share the instance and must agree on one call;
     * a second call throws in dev mode and is ignored otherwise.
     *
     * @param config - The skip condition and the default binding options.
     * @returns The service, for chaining.
     *
     * @example
     * ```typescript
     * this._keyBindings
     *     .configure({ skip: () => this.disabled, bindingDefaults: { repeat: true } })
     *     .set(arrowDown, () => this.next());
     * ```
     */
    public configure(config: IgxKeyBindingsConfig): this {
        if (this._configured) {
            if (isDevMode()) {
                throw new Error(
                    'IgxKeyBindingsService: configure() was already called for this element. ' +
                    'The owners that share the instance must agree on one configuration.'
                );
            }
            return this;
        }

        this._configured = true;
        this._bindingDefaults = { ...DEFAULT_BINDING_OPTIONS, ...config.bindingDefaults };

        const skip = config.skip ?? DEFAULT_SKIP;
        if (typeof skip === 'function') {
            this._skipCallback = skip;
            this._skipSelector = undefined;
        } else {
            this._skipSelector = skip.length ? skip.join(',') : undefined;
        }

        return this;
    }

    /**
     * Registers a binding for a key or a combination, such as
     * `[shiftKey, arrowUp]`. The order and the case of the names do not
     * matter.
     *
     * @remarks
     * A combination can be bound once. A second binding throws in dev mode and
     * is ignored otherwise, so the first binding stays.
     *
     * @param keys - A `KeyboardEvent.key` value, or the keys of a combination.
     * @param handler - Runs inside the Angular zone when the binding matches.
     * @param options - The options of the binding, over the binding defaults.
     * @returns The service, for chaining.
     *
     * @example
     * ```typescript
     * this._keyBindings
     *     .set(escapeKey, () => this.close())
     *     .set([altKey, arrowUp], () => this.close(), { repeat: false });
     * ```
     */
    public set(keys: string | string[], handler: IgxKeyBindingHandler, options?: IgxKeyBindingOptions): this {
        const parsed = parseKeys(keys);
        const combination = createCombinationKey(parsed.keys, sortModifiers(parsed.modifiers));

        if (this._bindings.has(combination)) {
            if (isDevMode()) {
                throw new Error(`IgxKeyBindingsService: the key combination "${combination}" is already bound for this element.`);
            }
            return this;
        }

        for (const key of [...parsed.keys, ...parsed.modifiers]) {
            this._allowedKeys.add(key);
        }
        this._bindings.set(combination, { handler, options });

        return this;
    }

    /**
     * Registers `handler` for both the Enter key and the Space bar.
     *
     * @param handler - Runs inside the Angular zone for Enter or Space.
     * @param options - The options of both bindings, over the binding defaults.
     * @returns The service, for chaining.
     *
     * @example
     * ```typescript
     * this._keyBindings.setActivateHandler((event) => this.toggle(event));
     * ```
     */
    public setActivateHandler(handler: IgxKeyBindingHandler, options?: IgxKeyBindingOptions): this {
        return this.set(enterKey, handler, options).set(spaceBar, handler, options);
    }

    /**
     * Handles the keyboard events of another element, such as overlay
     * content, with the configuration and the bindings of this service. The
     * service stops when it is destroyed or when `unsubscribe` is called.
     *
     * @param element - The element to observe.
     * @returns An object whose `unsubscribe` stops observing `element`.
     *
     * @example
     * ```typescript
     * const { unsubscribe } = this._keyBindings.observeElement(overlayContent);
     * // later, when the overlay closes
     * unsubscribe();
     * ```
     */
    public observeElement(element: Element): IgxKeyBindingObserver {
        if (!this._isBrowser) {
            return { unsubscribe: () => {} };
        }

        const controller = this._createListeners();
        this._zone.runOutsideAngular(() => this._listen(element, controller.signal));

        return {
            unsubscribe: () => {
                controller.abort();
                this._listeners.delete(controller);
            }
        };
    }

    //#endregion

    //#region Event handling

    private _createListeners(): AbortController {
        const controller = new AbortController();
        this._listeners.add(controller);
        return controller;
    }

    private _listen(element: EventTarget, signal: AbortSignal): void {
        element.addEventListener('keydown', this._onKeyEvent, { signal });
        element.addEventListener('keyup', this._onKeyEvent, { signal });
    }

    private readonly _releasePressedKeys = (): void => {
        this._pressedKeys.clear();
    };

    /** Focus that moves inside the host keeps the keys: their keyup still reaches the host. */
    private readonly _onHostFocusOut = (event: FocusEvent): void => {
        const next = event.relatedTarget as Node | null;
        if (!next || !this._host.contains(next)) {
            this._releasePressedKeys();
        }
    };

    private readonly _onKeyEvent = (event: Event): void => {
        // An observed element inside the host sees the event before the host.
        if (this._handledEvents.has(event)) {
            return;
        }
        this._handledEvents.add(event);

        // Browser autofill dispatches a plain `Event` named `keydown`.
        const keyboardEvent = event as KeyboardEvent;
        if (typeof keyboardEvent.key === 'string') {
            this._handleKeyEvent(keyboardEvent, event.currentTarget as Element);
        }
    };

    private _handleKeyEvent(event: KeyboardEvent, scope: Element): void {
        const key = event.key.toLowerCase();
        const isModifier = MODIFIERS.has(key);

        if (this._shouldSkip(event, key, scope)) {
            // A skipped keyup still releases the key.
            if (!isModifier && isKeyup(event)) {
                this._pressedKeys.delete(key);
            }
            return;
        }

        if (!isModifier) {
            this._pressedKeys.add(key);
        }

        const binding = this._findBinding(event, key, isModifier);
        if (binding) {
            this._runBinding(binding, event);
        }

        if (!isModifier && isKeyup(event)) {
            this._pressedKeys.delete(key);
        }
    }

    private _findBinding(event: KeyboardEvent, key: string, isModifier: boolean): KeyBinding | undefined {
        if (!isModifier && !hasModifiers(event) && this._pressedKeys.size === 1) {
            // Fast path: a single key without modifiers is its own combination.
            return this._bindings.get(key);
        }

        const modifiers = getActiveModifiers(event, isModifier && isKeyup(event) ? key : undefined);
        const binding = this._bindings.get(createCombinationKey(Array.from(this._pressedKeys), modifiers));

        // Overlapping presses leave several keys down. Fall back to the current
        // key, so its binding still runs.
        if (!binding && this._pressedKeys.size > 1) {
            return this._bindings.get(createCombinationKey([key], modifiers));
        }

        return binding;
    }

    private _runBinding(binding: KeyBinding, event: KeyboardEvent): void {
        const options = { ...this._bindingDefaults, ...binding.options };
        const triggers = options.triggers ?? DEFAULT_TRIGGERS;

        if (!triggers.includes(event.type as IgxKeyBindingTrigger)) {
            return;
        }

        if (options.preventDefault) {
            event.preventDefault();
        }
        if (options.stopPropagation) {
            event.stopPropagation();
        }

        // A held key keeps its default prevented, but the handler runs once.
        if (!isKeyup(event) && event.repeat && !options.repeat) {
            return;
        }

        // Same as a template listener: enter the zone and mark the view, so
        // OnPush and zoneless hosts refresh.
        this._zone.run(() => {
            this._cdr.markForCheck();
            binding.handler(event);
        });
    }

    /**
     * Whether to ignore the event: the key has no binding, a node between the
     * target and `scope` matches the skip selectors, or the skip callback
     * agrees.
     */
    private _shouldSkip(event: KeyboardEvent, key: string, scope: Element): boolean {
        if (!this._allowedKeys.has(key)) {
            return true;
        }

        const selector = this._skipSelector;
        if (selector) {
            // The path runs target first; `scope` itself is never matched, so
            // the service works on an input element.
            for (const node of event.composedPath()) {
                if (node === scope) {
                    break;
                }
                if (isElement(node) && node.matches(selector)) {
                    return true;
                }
            }
        }

        return this._skipCallback?.(event.target as Element, event) ?? false;
    }

    //#endregion
}
