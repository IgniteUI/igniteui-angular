import { Component, Host, Input } from '@angular/core';
import { OverlaySettings } from '../../services/public_api';
import { IgxGridToolbarComponent } from './grid-toolbar.component';


/**
 * Provides a pre-configured button to open the advanced filtering dialog of the grid.
 *
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 * <igx-grid-toolbar-advanced-filtering></igx-grid-toolbar-advanced-filtering>
 * <igx-grid-toolbar-advanced-filtering>Custom text</igx-grid-toolbar-advanced-filtering>
 * ```
 */
@Component({
    selector: 'igx-grid-toolbar-advanced-filtering',
    templateUrl: './grid-toolbar-advanced-filtering.component.html'
})
export class IgxGridToolbarAdvancedFilteringComponent {

    /**
     * Returns the grid containing this component.
     */
    get grid() {
        return this.toolbar.grid;
    }

    @Input()
    public overlaySettings: OverlaySettings;

    constructor(@Host() private toolbar: IgxGridToolbarComponent) { }
}
