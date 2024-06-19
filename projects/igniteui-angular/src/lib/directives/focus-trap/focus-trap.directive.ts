import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, booleanAttribute } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlatformUtil } from '../../core/utils';

@Directive({
    selector: '[igxFocusTrap]',
    standalone: true
})
export class IgxFocusTrapDirective implements AfterViewInit, OnDestroy {
    /** @hidden */
    public get element(): HTMLElement | null {
        return this.elementRef.nativeElement;
    }

    private destroy$ = new Subject();
    private _focusTrap = true;

    /** @hidden */
    constructor(
        private elementRef: ElementRef,
        protected platformUtil: PlatformUtil) {
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
    public set focusTrap(focusTrap: boolean) {
        this._focusTrap = focusTrap;
    }

    /** @hidden */
    public get focusTrap(): boolean {
        return this._focusTrap;
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        fromEvent(this.element, 'keydown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: KeyboardEvent) => {
                if (this._focusTrap && event.key === this.platformUtil.KEYMAP.TAB) {
                    this.handleTab(event);
                }
            });
    }

    /** @hidden */
    public ngOnDestroy() {
        this.destroy$.complete();
    }

    private handleTab(event) {
        const elements = this.getFocusableElements(this.element);
        if (elements.length > 0) {
            const focusedElement = this.getFocusedElement();
            const focusedElementIndex = elements.findIndex((element) => element as HTMLElement === focusedElement);
            const direction = event.shiftKey ? -1 : 1;
            let nextFocusableElementIndex = focusedElementIndex + direction;
            if (nextFocusableElementIndex < 0) {
                nextFocusableElementIndex = elements.length - 1;
            }
            if (nextFocusableElementIndex >= elements.length) {
                nextFocusableElementIndex = 0;
            }
            (elements[nextFocusableElementIndex] as HTMLElement).focus();
        } else {
            this.element.focus();
        }

        event.preventDefault();
    }

    private getFocusableElements(element: Element) {
        return Array.from(element.querySelectorAll(
            'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
    }

    private getFocusedElement(): HTMLElement | null {
        let activeElement =
            typeof document !== 'undefined' && document
                ? (document.activeElement as HTMLElement | null)
                : null;

        while (activeElement && activeElement.shadowRoot) {
            const newActiveElement = activeElement.shadowRoot.activeElement as HTMLElement | null;
            if (newActiveElement === activeElement) {
                break;
            } else {
                activeElement = newActiveElement;
            }
        }

        return activeElement;
    }
}
