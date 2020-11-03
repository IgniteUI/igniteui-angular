import { Component, Input } from '@angular/core';
import { BaseToolbarDirective } from './grid-toolbar.base';


/**
 * Provides a pre-configured column hiding component for the grid.
 *
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 *  <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
 * ```
 */
@Component({
    selector: 'igx-grid-toolbar-hiding',
    templateUrl: './grid-toolbar-hiding.component.html'
})
export class IgxGridToolbarHidingComponent extends BaseToolbarDirective {

    /**
     * Title text for the column action component
     */
    @Input()
    title = 'Visible Columns';

    /**
     * The placeholder text for the search input.
     */
    @Input()
    prompt = 'Search columns...';
}
