import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformUtil } from '../../core/utils';

/**
 * A shared service that registers component stylesheets exactly once per Angular injector,
 * using `document.adoptedStyleSheets` in the browser and a `<style>` tag injection in SSR.
 *
 * @example
 * ```typescript
 * // 1. Declare a unique symbol and import the generated CSS string at module level.
 * const STYLES_ID = Symbol('igx-my-component');
 *
 * // 2. Call register() in the component/directive constructor.
 * export class IgxMyComponent {
 *     constructor() {
 *         inject(IgxStylesRegistrar).register(STYLES_ID, MY_COMPONENT_CSS);
 *     }
 * }
 * ```
 */
/**
 * Tracks registered stylesheet ids per `Document`. Registered stylesheets live on
 * the document, which can be shared by multiple injectors, so the registry is keyed
 * by document rather than per service instance to avoid registering a stylesheet
 * more than once.
 */
const _registries = new WeakMap<Document, Map<symbol, CSSStyleSheet | null>>();

@Injectable({ providedIn: 'root' })
export class IgxStylesRegistrar {
    private readonly _document = inject(DOCUMENT);
    private readonly _platform = inject(PlatformUtil);

    /**
     * Registers a stylesheet identified by `id`. Subsequent calls with the same
     * `id` (against the same document) are no-ops, so it is safe to call from every
     * component instance.
     *
     * @param id    - A module-level `Symbol` that uniquely identifies the stylesheet.
     * @param css   - The CSS string to register (typically a generated `*.styles.ts` export).
     */
    public register(id: symbol, css: string): void {
        let registry = _registries.get(this._document);

        if (!registry) {
            registry = new Map<symbol, CSSStyleSheet | null>();
            _registries.set(this._document, registry);
        }

        if (registry.has(id)) return;

        if (this._platform.isBrowser) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(css);
            registry.set(id, sheet);
            this._document.adoptedStyleSheets = [...this._document.adoptedStyleSheets, sheet];
        } else {
            registry.set(id, null);
            const style = this._document.createElement('style');
            style.textContent = css;
            this._document.head?.appendChild(style);
        }
    }
}
