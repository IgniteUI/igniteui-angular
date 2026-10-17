const LIFECYCLE_PLACEHOLDER_TAG = 'igc-lifecycle-placeholder';
const LIFECYCLE_CONNECTED_EVENT = 'igcConnected';
const LIFECYCLE_DISCONNECTED_EVENT = 'igcDisconnected';

/** @hidden @internal */
export function registerLifecyclePlaceholderElement(): void {
    if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined' ||
        typeof CustomEvent === 'undefined' || customElements.get(LIFECYCLE_PLACEHOLDER_TAG)) {
        return;
    }

    class LifecyclePlaceholderElement extends HTMLElement {
        public connectedCallback(): void {
            this.dispatchEvent(new CustomEvent(LIFECYCLE_CONNECTED_EVENT));
        }

        public disconnectedCallback(): void {
            this.dispatchEvent(new CustomEvent(LIFECYCLE_DISCONNECTED_EVENT));
        }
    }

    customElements.define(LIFECYCLE_PLACEHOLDER_TAG, LifecyclePlaceholderElement);
}
