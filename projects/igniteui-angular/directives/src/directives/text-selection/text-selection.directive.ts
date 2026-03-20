import { Directive, ElementRef, HostListener, Input, booleanAttribute, inject } from '@angular/core';

@Directive({
    exportAs: 'igxTextSelection',
    selector: '[igxTextSelection]',
    standalone: true
})
export class IgxTextSelectionDirective {
    private element = inject(ElementRef);

    /**
     *  Determines whether the input element could be selected through the directive.
     */
    @Input({ alias: 'igxTextSelection', transform: booleanAttribute })
    public selected = true;

    /**
     * Returns the nativeElement of the element where the directive was applied.
     */
    public get nativeElement() {
        return this.element.nativeElement;
    }

    /**
     * @hidden
     */
    @HostListener('focus')
    public onFocus() {
        this.trigger();
    }

    /**
     * Triggers the selection of the element if it is marked as selectable.
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

