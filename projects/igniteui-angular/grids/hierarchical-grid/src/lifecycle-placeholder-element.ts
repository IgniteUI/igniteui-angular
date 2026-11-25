const LIFECYCLE_PLACEHOLDER_TAG = 'igc-lifecycle-placeholder';

/**
 * Element that reports when it gets connected to or disconnected from the DOM.
 *
 * The callbacks are invoked synchronously and directly from the custom element reactions,
 * instead of through dispatched DOM events. Event listeners registered by Angular templates are
 * wrapped by zone.js, so an event dispatched while the element is being inserted (which happens
 * in the middle of change detection, e.g. while a child grid is created) would run as a separate
 * zone task: when it is the outermost task it drains the microtask queue and triggers a
 * synchronous application tick, re-entering change detection.
 *
 * @hidden @internal
 */
export interface IgxLifecyclePlaceholderElement extends HTMLElement {
    /** Invoked when the element gets connected to the DOM. */
    onConnected?: () => void;
    /** Invoked when the element gets disconnected from the DOM. */
    onDisconnected?: () => void;
}

/** @hidden @internal */
export function registerLifecyclePlaceholderElement(): void {
    if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined' ||
        customElements.get(LIFECYCLE_PLACEHOLDER_TAG)) {
        return;
    }

    class LifecyclePlaceholderElement extends HTMLElement implements IgxLifecyclePlaceholderElement {
        // Declared only (no emitted field initializers), so callbacks assigned before the element
        // is upgraded are not overwritten by the upgrade.
        declare public onConnected?: () => void;
        declare public onDisconnected?: () => void;

        public connectedCallback(): void {
            this.onConnected?.();
        }

        public disconnectedCallback(): void {
            this.onDisconnected?.();
        }
    }

    customElements.define(LIFECYCLE_PLACEHOLDER_TAG, LifecyclePlaceholderElement);
}
