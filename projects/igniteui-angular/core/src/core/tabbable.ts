const NATIVELY_FOCUSABLE = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'details > summary:first-of-type'
].join(', ');

/** Elements that take part in the sequential focus navigation, unless excluded by `isTabbable`. */
const TABBABLE_CANDIDATES = `${NATIVELY_FOCUSABLE}, [contenteditable], [tabindex]`;

function isEditingHost(element: HTMLElement): boolean {
    return element.isContentEditable && !element.parentElement?.isContentEditable;
}

/**
 * Whether Tab reaches `element`.
 *
 * @remarks
 * An explicit `tabindex` decides whether the element is in the tab order.
 * Otherwise, the natively focusable elements are, and a `contenteditable`
 * element is only when it is an editing host, editable unlike its parent. The
 * element must also be enabled, outside of `aria-hidden="true"` and `inert`
 * subtrees, and visible.
 *
 * @param element - The element to check.
 * @returns `true` when the element is in the tab order.
 *
 * @example
 * ```typescript
 * if (isTabbable(target)) {
 *     target.focus();
 * }
 * ```
 *
 * @hidden @internal
 */
export function isTabbable(element: HTMLElement): boolean {
    const inTabOrder = element.hasAttribute('tabindex')
        ? element.tabIndex >= 0
        : element.matches(NATIVELY_FOCUSABLE) || isEditingHost(element);

    return inTabOrder
        && !element.matches(':disabled, [disabled]')
        && !element.closest('[aria-hidden="true"], [inert]')
        // `checkVisibility` is not implemented in some environments (e.g. jsdom)
        && (element.checkVisibility?.({ visibilityProperty: true }) ?? true);
}

/**
 * Returns the focused element of the root of `node`: the document, or the shadow root that holds `node`.
 *
 * @remarks
 * When the focus is inside another shadow root, its shadow host is returned.
 *
 * @param node - A node in the root to read.
 * @returns The focused element, or `null`.
 *
 * @example
 * ```typescript
 * const focused = getActiveElement(this.element);
 * ```
 *
 * @hidden @internal
 */
export function getActiveElement(node: Node): Element | null {
    return (node.getRootNode() as Document | ShadowRoot).activeElement;
}

/**
 * Returns the descendants of `root` that Tab reaches, in document order.
 *
 * @remarks
 * A component that renders a native control, such as `igx-checkbox`, takes
 * part through that control, not through its host.
 *
 * @param root - The element whose descendants to search.
 * @returns The tabbable descendants, without `root` itself.
 *
 * @example
 * ```typescript
 * const [first] = getTabbableElements(this.element);
 * first?.focus();
 * ```
 *
 * @hidden @internal
 */
export function getTabbableElements(root: ParentNode): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_CANDIDATES)).filter(isTabbable);
}
