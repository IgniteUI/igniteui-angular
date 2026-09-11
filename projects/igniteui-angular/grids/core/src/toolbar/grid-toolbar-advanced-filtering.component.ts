import { Component, Input, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IgxToolbarToken } from './token';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IFilteringExpressionsTree, isTree, OverlaySettings } from 'igniteui-angular/core';

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
 * @igxParent IgxGridToolbarComponent, IgxGridToolbarActionsComponent
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxIconComponent]
})
export class IgxGridToolbarAdvancedFilteringComponent implements OnInit {
    private toolbar = inject<IgxToolbarToken>(IgxToolbarToken);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    protected numberOfColumns!: number;
    /**
     * Returns the grid containing this component.
     * @hidden @internal
     */
    public get grid() {
        return this.toolbar.grid;
    }

    @Input()
    public overlaySettings!: OverlaySettings;

    /**
     * @hidden
     */
    public ngOnInit(): void {
        // Initial value
        this.numberOfColumns = this.grid?.advancedFilteringExpressionsTree ? this.extractUniqueFieldNamesFromFilterTree(this.grid?.advancedFilteringExpressionsTree).length : 0;

        // Subscribing for future updates
        this.grid?.advancedFilteringExpressionsTreeChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(filteringTree => {
                this.numberOfColumns = this.extractUniqueFieldNamesFromFilterTree(filteringTree).length;
                // The tree is changed from the advanced filtering dialog, i.e. outside of a check of
                // this view, so nothing else marks it dirty in a zoneless app.
                this.cdr.markForCheck();
            });
    }

    protected extractUniqueFieldNamesFromFilterTree(filteringTree?: IFilteringExpressionsTree) : string[] {
        const columnNames: string[] = [];
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
