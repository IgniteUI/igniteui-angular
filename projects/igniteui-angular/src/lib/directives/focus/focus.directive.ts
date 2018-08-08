import { Directive, ElementRef, Input, NgModule } from '@angular/core';

@Directive({
    exportAs: 'igxFocus',
    selector: '[igxFocus]'
})
export class IgxFocusDirective {

    private focusState = true;
    /**
     * Returns the state of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let isFocusOn = this.igxFocus.focused;
     * ```
     * @memberof IgxFocusDirective
     */
    @Input('igxFocus')
    get focused(): boolean {
        return this.focusState;
    }
    /**
     * Sets the state of the igxFocus.
     * ```html
     * <igx-input-group >
     *  <input #focusContainer igxInput [igxFocus]="true"/>
     * </igx-input-group>
     * ```
     * @memberof IgxFocusDirective
     */
    set focused(val: boolean) {
        this.focusState = val;
        this.trigger();
    }
    /**
     * Gets the native element of the igxFocus.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * let igxFocusNativeElement = this.igxFocus.nativeElement;
     * ```
     * @memberof IgxFocusDirective
     */
    get nativeElement() {
        return this.element.nativeElement;
    }

    constructor(private element: ElementRef) { }
    /**
     * Triggers the igxFocus state.
     * ```typescript
     * @ViewChild('focusContainer', {read: IgxFocusDirective})
     * public igxFocus: IgxFocusDirective;
     * this.igxFocus.trigger();
     * ```
     * @memberof IgxFocusDirective
     */
    trigger() {
        if (this.focusState) {
            requestAnimationFrame(() => this.nativeElement.focus());
        }
    }
}
/**
 * The IgxFocusModule provides the {@link IgxFocusDirective} inside your application.
 */
@NgModule({
    declarations: [IgxFocusDirective],
    exports: [IgxFocusDirective]
})
export class IgxFocusModule { }
