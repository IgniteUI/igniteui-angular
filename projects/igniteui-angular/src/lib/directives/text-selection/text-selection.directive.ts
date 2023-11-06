import { Directive, ElementRef, HostListener, Input, booleanAttribute } from '@angular/core';

@Directive({
    exportAs: 'igxTextSelection',
    selector: '[igxTextSelection]',
    standalone: true
})
export class IgxTextSelectionDirective {
    /**
     *  Determines whether the input element could be selected through the directive.
     *
     * ```html
     * <!--set-->
     * <input
     *   type="text"
     *   id="firstName"
     *   [igxTextSelection]="true">
     * </input>
     *
     * <input
     *   type="text"
     *   id="lastName"
     *   igxTextSelection
     *   [selected]="true">
     * </input>
     * ```
     */
    @Input({ alias: 'igxTextSelection', transform: booleanAttribute })
    public selected = true;

    /**
     * Returns the nativeElement of the element where the directive was applied.
     *
     * ```html
     * <input
     *   type="text"
     *   id="firstName"
     *   igxTextSelection>
     * </input>
     * ```
     *
     * ```typescript
     * @ViewChild('firstName',
     *  {read: IgxTextSelectionDirective})
     * public inputElement: IgxTextSelectionDirective;
     *
     * public getNativeElement() {
     *  return this.inputElement.nativeElement;
     * }
     * ```
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    constructor(private element: ElementRef) { }

    /**
     * @hidden
     */
    @HostListener('focus')
    public onFocus() {
        this.trigger();
    }

    /**
     * Triggers the selection of the element if it is marked as selectable.
     *
     * ```html
     * <input
     *   type="text"
     *   id="firstName"
     *   igxTextSelection>
     * </input>
     * ```
     *
     * ```typescript
     * @ViewChild('firstName',
     *  {read: IgxTextSelectionDirective})
     * public inputElement: IgxTextSelectionDirective;
     *
     * public triggerElementSelection() {
     *  this.inputElement.trigger();
     * }
     * ```
     */

    public trigger() {
        if (this.selected && this.nativeElement.value.length) {
            // delay the select call to avoid race conditions in case the directive is applied
            // to an element with its own focus handler
            requestAnimationFrame(() => this.nativeElement.select());
        }
    }
}

/**
 * @hidden
 */

