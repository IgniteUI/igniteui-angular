import { Directive, Input } from '@angular/core';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective {
    /**
     * An @Input property that set an instance of the grid for which to display the actions.
     * @example
     * ```html
     *  <igx-grid-pinning-actions [grid]="grid1"></igx-grid-pinning-actions>
     *  <igx-grid-editing-actions [grid]="grid1"></igx-grid-editing-actions>
     * ```
     */
    @Input() public grid;

    /**
     * Sets the context of an action strip.
     * The context should be an instance of a @Component, that has element property.
     * This element will be the placeholder of the action strip.
     * @example
     * ```html
     *  <igx-grid-pinning-actions [grid]="grid1"></igx-grid-pinning-actions>
     *  <igx-grid-editing-actions [grid]="grid1"></igx-grid-editing-actions>
     * ```
     */
    @Input() public context;
}
