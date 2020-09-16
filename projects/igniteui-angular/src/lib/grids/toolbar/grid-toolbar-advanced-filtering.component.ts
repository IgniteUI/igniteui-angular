import { Component } from '@angular/core';
import { GridBaseAPIService } from '../api.service';
import { IgxGridBaseDirective } from '../grid-base.directive';
import { GridType } from '../common/grid.interface';


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
        return this.api.grid;
    }

    constructor(private api: GridBaseAPIService<IgxGridBaseDirective & GridType>) { }
}
