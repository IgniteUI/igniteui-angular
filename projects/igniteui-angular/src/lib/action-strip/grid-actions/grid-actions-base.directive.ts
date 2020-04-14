import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective {
    /**
     * An @Input property that set an instance of the grid for which to display the actions.
     * ```html
     *  <igx-grid-editing-actions [grid]="grid1"></igx-grid-editing-actions>
     * ```
     */
    @Input() grid;

    @Input() context;
}