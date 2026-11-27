/** The input types whose value or caret the arrow keys change. */
const ARROW_KEY_INPUT_TYPES = new Set([
    'text', 'search', 'email', 'url', 'tel', 'password', 'number',
    'date', 'datetime-local', 'month', 'time', 'week', 'range', 'radio'
]);

/** The roles of the widgets that use the arrow keys themselves. */
const ARROW_KEY_ROLES = new Set([
    'textbox', 'searchbox', 'combobox', 'slider', 'spinbutton', 'listbox', 'radiogroup', 'radio',
    'menu', 'menubar', 'tablist', 'toolbar', 'tree', 'treegrid', 'grid'
]);

/**
 * Whether `element` uses the arrow keys itself: a text-like input, a
 * textarea, a select, editable content, or an element whose role is that of
 * a widget with its own arrow key navigation, such as a slider or a listbox.
 *
 * @remarks
 * Only the first token of the `role` attribute counts, as it is the role that
 * assistive technology uses when it supports it.
 *
 * @param element - The element to check.
 * @returns `true` when the element handles the arrow keys itself.
 *
 * @example
 * ```typescript
 * if (!usesArrowKeys(target)) {
 *     this.moveToNextItem();
 * }
 * ```
 *
 * @hidden @internal
 */
export function usesArrowKeys(element: Element): boolean {
    if (element instanceof HTMLInputElement) {
        return ARROW_KEY_INPUT_TYPES.has(element.type);
    }
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        return true;
    }
    if (element instanceof HTMLElement && element.isContentEditable) {
        return true;
    }

    const role = element.getAttribute('role')?.trim().split(/\s+/)[0];
    return !!role && ARROW_KEY_ROLES.has(role);
}

/**
 * Whether a key event comes from a control that uses the arrow keys itself,
 * so a container that navigates with the arrow keys must leave the key to it.
 *
 * @remarks
 * Checks the elements between the target and `scope`, without `scope`
 * itself, along the composed path of the event, so a control in a shadow
 * root counts too. Call it while the event is dispatched, as the path is
 * empty afterwards.
 *
 * @param event - The keyboard event, during its dispatch.
 * @param scope - The container that handles the event, such as a list.
 * @param ignore - The elements that do not count, such as a nested list that the container treats as one control.
 * @returns `true` when an element on the path uses the arrow keys.
 *
 * @example
 * ```typescript
 * keyBindings.configure({ skip: (_, event) => isFromArrowKeyControl(event, this.element) });
 * ```
 *
 * @hidden @internal
 */
export function isFromArrowKeyControl(event: Event, scope: Element, ignore?: (element: Element) => boolean): boolean {
    for (const node of event.composedPath()) {
        if (node === scope) {
            return false;
        }
        if (node instanceof Element && !ignore?.(node) && usesArrowKeys(node)) {
            return true;
        }
    }
    return false;
}
