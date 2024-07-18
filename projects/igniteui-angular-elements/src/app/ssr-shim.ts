import { Element, HTMLElement, CustomElementRegistry, customElements } from '@lit-labs/ssr-dom-shim'

if (typeof window === 'undefined') {
    globalThis.Element = Element;
    globalThis.HTMLElement = HTMLElement;
    globalThis.CustomElementRegistry = CustomElementRegistry;
    globalThis.customElements = customElements;
}
