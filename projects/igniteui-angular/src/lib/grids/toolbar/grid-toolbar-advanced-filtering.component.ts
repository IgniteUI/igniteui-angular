import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { IgxToolbarToken } from './token';
import { OverlaySettings } from '../../services/overlay/utilities';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxRippleDirective } from '../../directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { isTree } from '../../data-operations/expressions-tree-util';

/* blazorElement */
/* wcElementTag: igc-grid-toolbar-advanced-filtering */
/* blazorIndirectRender */
/* blazorAlternateBaseType: GridToolbarBaseAction */
/* jsonAPIManageItemInMarkup */
/* singleInstanceIdentifier */
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
    templateUrl: './grid-toolbar-advanced-filtering.component.html',
    imports: [IgxButtonDirective, IgxRippleDirective, IgxIconComponent]
})
export class IgxGridToolbarAdvancedFilteringComponent implements OnInit {
    protected numberOfColumns: number;
    /**
     * Returns the grid containing this component.
     * @hidden @internal
     */
    public get grid() {
        return this.toolbar.grid;
    }

    @Input()
    public overlaySettings: OverlaySettings;

    constructor( @Inject(IgxToolbarToken) private toolbar: IgxToolbarToken) { }

    /**
     * @hidden
     */
    public ngOnInit(): void {
        // Initial value
        this.numberOfColumns = this.grid?.advancedFilteringExpressionsTree ? this.extractUniqueFieldNamesFromFilterTree(this.grid?.advancedFilteringExpressionsTree).length : 0;

        // Subscribing for future updates
        this.grid?.advancedFilteringExpressionsTreeChange.subscribe(filteringTree => {
            this.numberOfColumns = this.extractUniqueFieldNamesFromFilterTree(filteringTree).length;
        });
    }

    protected extractUniqueFieldNamesFromFilterTree(filteringTree?: IFilteringExpressionsTree) : string[] {
        const columnNames = [];
        if (!filteringTree) return columnNames;
        filteringTree.filteringOperands.forEach((expr) => {
            if (isTree(expr)) {
                columnNames.push(...this.extractUniqueFieldNamesFromFilterTree(expr));
            } else {
                columnNames.push(expr.fieldName);
            }
        });
        return [...new Set(columnNames)];
    }
}
