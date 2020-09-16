import { Component, Input } from '@angular/core';
import { BaseToolbarDirective } from './common';

/**
 * Provides a pre-configured column pinning component for the grid.
 *
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 *  <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
 * ```
 */
@Component({
    selector: 'igx-grid-toolbar-pinning',
    templateUrl: './grid-toolbar-pinning.component.html'
})
export class IgxGridToolbarPinningComponent extends BaseToolbarDirective {

    /**
     * Title text for the column action component
     */
    @Input()
    title = 'Pinned Columns';

    /**
     * The placeholder text for the search input.
     */
    @Input()
    prompt = 'Search columns...';

    /**
     * Sets the height of the column list in the dropdown.
     */
    @Input()
    columnListHeight = '100%';
}
