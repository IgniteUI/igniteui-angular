import { Component, Inject, Input } from '@angular/core';
import { IgxToolbarToken } from './token';
import { OverlaySettings } from '../../services/overlay/utilities';

/* blazorElement */
/* wcElementTag: igc-grid-toolbar-advanced-filtering */
/* blazorIndirectRender */
/* jsonAPIManageItemInMarkup */
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
    public get grid() {
        return this.toolbar.grid;
    }

    @Input()
    public overlaySettings: OverlaySettings;

    constructor( @Inject(IgxToolbarToken) private toolbar: IgxToolbarToken) { }
}
