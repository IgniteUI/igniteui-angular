import { AfterViewInit, Directive, ElementRef, Input, NgModule, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlatformUtil } from '../../core/utils';

@Directive({
    selector: '[igxFocusTrap]'
})
export class IgxFocusTrapDirective implements AfterViewInit, OnDestroy {
    /** @hidden */
    public get element(): HTMLElement | null {
        return this.elementRef.nativeElement;
    }

    private destroy$ = new Subject();
    private _focusTrap: boolean;

    /** @hidden */
    constructor(
        private elementRef: ElementRef,
        protected platformUtil: PlatformUtil) {
    }

    /**
     * Sets the type of the button.
     *
     * @example
     * ```html
     * <button igxButton="icon"></button>
     * ```
     */
    @Input('igxFocusTrap')
    public set focusTrap(focusTrap: boolean) {
        this._focusTrap = focusTrap || true;
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        if (this._focusTrap) {
            fromEvent(this.element, 'keydown')
                .pipe(takeUntil(this.destroy$))
                .subscribe((event: KeyboardEvent) => {
                    if (event.key === this.platformUtil.KEYMAP.TAB) {
                        this.handleTab(event);
                    }
                });
        }
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

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxFocusTrapDirective],
    exports: [IgxFocusTrapDirective]
})
export class IgxFocusTrapModule { }
