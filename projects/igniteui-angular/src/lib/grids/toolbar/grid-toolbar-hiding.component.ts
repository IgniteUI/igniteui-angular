import { Component } from '@angular/core';
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
export class IgxGridToolbarHidingComponent extends BaseToolbarDirective { }
