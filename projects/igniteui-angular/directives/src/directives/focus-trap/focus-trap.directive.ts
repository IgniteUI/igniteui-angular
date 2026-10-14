import { Directive, ElementRef, Input, booleanAttribute, inject } from '@angular/core';
import { PlatformUtil } from 'igniteui-angular/core';

/** Elements that take part in the sequential focus navigation, unless excluded by `isTabbable`. */
const TABBABLE_CANDIDATES = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'details > summary:first-of-type',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]'
].join(', ');

@Directive({
    selector: '[igxFocusTrap]',
    host: {
        '(keydown)': 'onKeydown($event)'
    }
})
export class IgxFocusTrapDirective {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    protected platformUtil = inject(PlatformUtil);

    /** @hidden */
    public get element(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /**
     * Sets whether the Tab key focus is trapped within the element.
     *
     * @example
     * ```html
     * <div igxFocusTrap="true"></div>
     * ```
     */
    @Input({ alias: 'igxFocusTrap', transform: booleanAttribute })
    public focusTrap = true;

    /** @hidden */
    protected onKeydown(event: KeyboardEvent): void {
        if (!this.focusTrap || event.key !== this.platformUtil.KEYMAP.TAB) {
            return;
        }

        const elements = this.getTabbableElements();
        const next = elements.length ? this.getNextElement(elements, event.shiftKey) : this.element;
        next.focus();
        event.preventDefault();
    }

    private getTabbableElements(): HTMLElement[] {
        return Array.from(this.element.querySelectorAll<HTMLElement>(TABBABLE_CANDIDATES))
            .filter(element => this.isTabbable(element));
    }

    private isTabbable(element: HTMLElement): boolean {
        return !(element.hasAttribute('tabindex') && element.tabIndex < 0)
            && !element.matches(':disabled, [disabled]')
            && !element.closest('[aria-hidden="true"], [inert]')
            // `checkVisibility` is not implemented in some environments (e.g. jsdom)
            && (element.checkVisibility?.({ visibilityProperty: true }) ?? true);
    }

    /**
     * Returns the element after (or before, when moving backwards) the focused element in DOM order,
     * wrapping around at the boundaries of the focus trap.
     */
    private getNextElement(elements: HTMLElement[], backwards: boolean): HTMLElement {
        // The active element of the trap's root is either the focused element or the shadow host containing it
        const root = this.element.getRootNode() as Document | ShadowRoot;
        const focused = root.activeElement ?? this.element;

        if (backwards) {
            return elements.findLast(element => focused.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING)
                ?? elements[elements.length - 1];
        }
        return elements.find(element => focused.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
            ?? elements[0];
    }
}
