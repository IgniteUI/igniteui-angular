import { Directive, ElementRef, HostListener, Input, NgModule } from '@angular/core';

@Directive({
    exportAs: 'igxTextSelection',
    selector: '[igxTextSelection]'
})
export class IgxTextSelectionDirective {
    private selectionState = true;

    /**
     * Returns whether the input element is selectable through the directive.
     *
     * ```typescript
     * // get
     * @ViewChild('firstName',
     *  {read: IgxTextSelectionDirective})
     * public firstName: IgxTextSelectionDirective;
     *
     * public getFirstNameSelectionStatus() {
     *  return this.firstName.selected;
     * }
     * ```
     */
    @Input('igxTextSelection')
    public get selected(): boolean {
        return this.selectionState;
    }

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
    public set selected(val: boolean) {
        this.selectionState = val;
    }

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
            requestAnimationFrame(() => this.nativeElement.setSelectionRange(0, this.nativeElement.value.length));
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxTextSelectionDirective],
    exports: [IgxTextSelectionDirective]
})
export class IgxTextSelectionModule { }
