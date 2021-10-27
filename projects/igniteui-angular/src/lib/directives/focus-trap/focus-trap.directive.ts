import { AfterViewInit, ContentChild, Directive, ElementRef, HostBinding, Input, NgModule, ViewChild } from "@angular/core";
import { IgxToggleDirective } from "igniteui-angular";
import { PlatformUtil } from "../../core/utils";

@Directive({
    selector: '[igxFocusTrap]'
})
export class IgxFocusTrapDirective implements AfterViewInit {
    /**
     * @hidden
     */
    public get element(): HTMLElement | null {
        return this.elementRef.nativeElement;
    }

    /** @hidden */
    public ngAfterViewInit(): void {
        const modal = this.element.querySelector('.igx-toggle--hidden') as HTMLElement;
        modal.addEventListener('keydown', event => {
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

    private get target(): any {
        return this.overlay.querySelector('.igx-toggle');
    }

    private get overlay(): Element {
        return document.querySelector('.igx-overlay');
    }

    private handleTab(event) {
        const elements = this.getFocusableElements(this.target);
        if (elements.length > 0) {
            const firstFocusableElement = elements[0] as HTMLElement;
            const lastFocusableElement = elements[elements.length - 1] as HTMLElement;
            const focusedElement = this.getFocusedElement();
            if (event.shiftKey) {
                if (focusedElement === (this.target as HTMLElement) || focusedElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                } else {
                    const focusedElementIndex = elements.findIndex((element) => element as HTMLElement === focusedElement);
                    (elements[focusedElementIndex - 1] as HTMLElement).focus();
                }
            } else {
                if (focusedElement === (this.target as HTMLElement) || focusedElement === lastFocusableElement) {
                    firstFocusableElement.focus();

                } else {
                    const focusedElementIndex = elements.findIndex((element) => element as HTMLElement === focusedElement);
                    (elements[focusedElementIndex + 1] as HTMLElement).focus();
                }
            }
            event.preventDefault();
        }
    }

    private getFocusableElements(element: Element){
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
