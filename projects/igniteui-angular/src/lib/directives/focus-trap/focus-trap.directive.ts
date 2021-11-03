import { AfterViewInit, Directive, ElementRef, NgModule, OnDestroy } from "@angular/core";
import { fromEvent, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PlatformUtil } from "../../core/utils";

@Directive({
    selector: '[igxFocusTrap]'
})
export class IgxFocusTrapDirective implements AfterViewInit, OnDestroy {
    /**
     * @hidden
     */
    public get element(): HTMLElement | null {
        return this.elementRef.nativeElement;
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        fromEvent(this.element, 'keydown')
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: KeyboardEvent) => {
                if (event.key === this.platformUtil.KEYMAP.TAB) {
                    this.handleTab(event);
                }
            });
    }

    /**
     * @hidden
     */
    constructor(
        private elementRef: ElementRef,
        protected platformUtil: PlatformUtil) {
    }

    /** @hidden */
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private destroy$ = new Subject();

    private handleTab(event) {
        const elements = this.getFocusableElements(this.element);
        if (elements.length > 0) {
            const focusedElement = this.getFocusedElement();
            const focusedElementIndex = elements.findIndex((element) => element as HTMLElement === focusedElement);
            const direction = event.shiftKey ? -1 : 1;
            let nextFocusableElementIndex = focusedElementIndex + direction;
            nextFocusableElementIndex = nextFocusableElementIndex < 0 ? elements.length - 1 :
                                        nextFocusableElementIndex >= elements.length ? 0 :
                                        nextFocusableElementIndex;
            (elements[nextFocusableElementIndex] as HTMLElement).focus();
        }

        event.preventDefault();
    }

    private getFocusableElements(element: Element) {
        return Array.from(element.querySelectorAll(
            'a[href], button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute('disabled') && !el.getAttribute("aria-hidden"));
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
