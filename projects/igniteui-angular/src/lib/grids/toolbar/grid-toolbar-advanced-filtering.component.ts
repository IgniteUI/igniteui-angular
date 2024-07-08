import { AfterViewInit, Component, Inject, Input } from '@angular/core';
import { IgxToolbarToken } from './token';
import { OverlaySettings } from '../../services/overlay/utilities';
import { IgxIconComponent } from '../../icon/icon.component';
import { NgClass, NgIf } from '@angular/common';
import { IgxRippleDirective } from '../../directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { FilteringExpressionsTree, IFilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IFilteringExpression } from '../../data-operations/filtering-expression.interface';


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
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, NgClass, IgxIconComponent, NgIf]
})
export class IgxGridToolbarAdvancedFilteringComponent implements AfterViewInit {
    /**
     * @hidden @internal
     */
    protected numberOfColumns: number;
    /**
     * Returns the grid containing this component.
     */
    public get grid() {
        return this.toolbar.grid;
    }

    @Input()
    public overlaySettings: OverlaySettings;

    constructor( @Inject(IgxToolbarToken) private toolbar: IgxToolbarToken) {
        this.grid?.advancedFilteringExpressionsTreeChange.subscribe(filteringTree => {
            this.numberOfColumns = this.extractUniqueFieldNamesFromFilterTree(filteringTree).length;
        });
    }

    /**
     * @hidden
     */
    public ngAfterViewInit(): void {
        this.numberOfColumns = this.grid?.advancedFilteringExpressionsTree ? this.extractUniqueFieldNamesFromFilterTree(this.grid?.advancedFilteringExpressionsTree).length : 0;
    }

    protected extractUniqueFieldNamesFromFilterTree(filteringTree?: IFilteringExpressionsTree) : string[] {
        const columnNames = [];
        if (!filteringTree) return columnNames;
        filteringTree.filteringOperands.forEach((expr) => {
            if (expr instanceof FilteringExpressionsTree) {
                columnNames.push(...this.extractUniqueFieldNamesFromFilterTree(expr));
            } else {
                columnNames.push((expr as IFilteringExpression).fieldName);
            }
        });
        return [...new Set(columnNames)];
    }
}
