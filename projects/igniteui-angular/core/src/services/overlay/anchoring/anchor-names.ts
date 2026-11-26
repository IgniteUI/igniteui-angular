let counter = 0;

interface AnchorRecord {
    /** Computed `anchor-name` before the element was touched, `''` for `none`. */
    authorValue: string;
    /** Inline `anchor-name` before the element was touched, `''` if none. */
    inlineValue: string;
    /** Priority of the inline value, `'important'` or `''`. */
    inlinePriority: string;
    names: string[];
}

const records = new WeakMap<HTMLElement, AnchorRecord>();

/**
 * @hidden @internal
 * Returns a new, document-unique anchor name.
 */
export function acquireAnchorName(): string {
    return `--igx-overlay-anchor-${counter++}`;
}

/**
 * @hidden @internal
 * Adds `name` to the element's `anchor-name` list, keeping any author value.
 */
export function addAnchorName(element: HTMLElement, name: string): void {
    let record = records.get(element);
    if (!record) {
        const computed = element.ownerDocument.defaultView
            ?.getComputedStyle(element).getPropertyValue('anchor-name').trim() ?? '';
        record = {
            authorValue: computed === 'none' ? '' : computed,
            inlineValue: element.style.getPropertyValue('anchor-name'),
            inlinePriority: element.style.getPropertyPriority('anchor-name'),
            names: []
        };
        records.set(element, record);
    }
    if (!record.names.includes(name)) {
        record.names.push(name);
    }
    write(element, record);
}

/**
 * @hidden @internal
 * Removes `name` from the element's `anchor-name` list. Restores the author inline value when no names remain.
 */
export function removeAnchorName(element: HTMLElement, name: string): void {
    const record = records.get(element);
    if (!record) {
        return;
    }
    record.names = record.names.filter(n => n !== name);
    if (record.names.length) {
        write(element, record);
        return;
    }
    if (record.inlineValue) {
        element.style.setProperty('anchor-name', record.inlineValue, record.inlinePriority);
    } else {
        element.style.removeProperty('anchor-name');
    }
    records.delete(element);
}

/**
 * Writes the author value followed by the overlay names. `!important`, so that an `!important` author
 * rule cannot drop the overlay names; the author value stays in the list.
 */
function write(element: HTMLElement, record: AnchorRecord): void {
    element.style.setProperty('anchor-name', [record.authorValue, ...record.names].filter(Boolean).join(', '), 'important');
}
