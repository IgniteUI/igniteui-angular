import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    ElementRef,
    ViewChildren,
    QueryList,
    ViewChild,
    TemplateRef
} from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowComponent } from '../row.component';
import { IgxHierarchicalGridCellComponent } from './hierarchical-cell.component';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid-row',
    templateUrl: './hierarchical-row.component.html',
    providers: [{ provide: IgxRowComponent, useExisting: forwardRef(() => IgxHierarchicalRowComponent) }]
})
export class IgxHierarchicalRowComponent extends IgxRowComponent<IgxHierarchicalGridComponent> {
    /**
     * The rendered cells in the row component.
     *
     * ```typescript
     * // get the cells of the third selected row
     * let selectedRowCells = this.grid.selectedRows[2].cells;
     * ```
     */
    @ViewChildren(forwardRef(() => IgxHierarchicalGridCellComponent), { read: IgxHierarchicalGridCellComponent })
    public cells: QueryList<IgxHierarchicalGridCellComponent>;

    @ViewChild('expander', { read: ElementRef, static: false })
    public expander: ElementRef;

    /**
    * @hidden
    */
   @ViewChild('defaultExpandedTemplate', { read: TemplateRef, static: true })
   protected defaultExpandedTemplate: TemplateRef<any>;

    /**
    * @hidden
    */
   @ViewChild('defaultEmptyTemplate', { read: TemplateRef, static: true })
   protected defaultEmptyTemplate: TemplateRef<any>;

    /**
    * @hidden
    */
   @ViewChild('defaultCollapsedTemplate', { read: TemplateRef, static: true })
   protected defaultCollapsedTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex = 0;

        /**
     * Returns whether the row is expanded.
     * ```typescript
     * const RowExpanded = this.grid1.rowList.first.expanded;
     * ```
     */
    @HostBinding('class.igx-grid__tr--expanded')
    public get expanded() {
        return this.grid.isExpanded(this.rowData);
    }

    public get hasChildren() {
        return  !!this.grid.childLayoutKeys.length;
    }

    /**
     * @hidden
     */
    @HostBinding('class.igx-grid__tr--highlighted')
    public get highlighted() {
        return this.grid && this.grid.highlightedRowID === this.rowID;
    }

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle(event?) {
        if (this.added) {
            return;
        }
        const grid = this.gridAPI.grid;
        this.endEdit(grid.rootGrid);
        const state = this.gridAPI.grid.hierarchicalState;
        if (!this.expanded) {
            state.push({ rowID: this.rowID });
            grid.hierarchicalState = [...state];
        } else {
            grid.hierarchicalState = state.filter(v => {
                return v.rowID !== this.rowID;
            });
        }
        grid.cdr.detectChanges();
    }

    /**
     * @hidden
     * @internal
     */
    public select = () => {
        this.grid.selectRows([this.rowID]);
    }

    /**
     * @hidden
     * @internal
     */
    public deselect = () => {
        this.grid.deselectRows([this.rowID]);
    }

    /**
    * @hidden
    */
    public get iconTemplate() {
        let expandable = true;
        if (this.grid.hasChildrenKey) {
            expandable = this.rowData[this.grid.hasChildrenKey];
        }
        if (!expandable) {
            return this.defaultEmptyTemplate;
        }
        if (this.expanded) {
            return this.grid.rowExpandedIndicatorTemplate || this.defaultExpandedTemplate;
        } else {
            return this.grid.rowCollapsedIndicatorTemplate || this.defaultCollapsedTemplate;
        }
    }

    private endEdit(grid: IgxHierarchicalGridComponent) {
        if (grid.crudService.inEditMode) {
            grid.endEdit();
        }
        grid.hgridAPI.getChildGrids(true).forEach(g => {
            if (g.crudService.inEditMode) {
            g.endEdit();
        }});
    }
}
