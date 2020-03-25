import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    forwardRef,
    HostListener,
    Input
} from '@angular/core';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxRowDirective } from '../grid';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-hierarchical-grid-row-ghost',
    templateUrl: './hierarchical-row-ghost.component.html',
    providers: [{ provide: IgxRowDirective, useExisting: forwardRef(() => IgxHierarchicalRowGhostComponent) }]
})
export class IgxHierarchicalRowGhostComponent extends IgxHierarchicalRowComponent {
    public editable = false;

    /**
    * @hidden
    */
    public get expanderClassResolved() {
        return { [this.expanderClass]: true };
    }

    /**
     *  The data passed to the row component.
     *
     * ```typescript
     * // get the row data for the first selected row
     * let selectedRowData = this.grid.selectedRows[0].rowData;
     * ```
     */
    @Input()
    public get rowData(): any {
        return this._rowData.recordData;
    }

    public set rowData(v: any) {
        this._rowData = v;
    }
    
    public get realRowID() {
        const primaryKey = this.grid.primaryKey;
        return primaryKey ? this._rowData.recordData[primaryKey] : this._rowData.recordData;
    }

    /**
    * @hidden
    */
    public getIconTemplate() {
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

    /**
     * Toggles the hierarchical row.
     * ```typescript
     * this.grid1.rowList.first.toggle()
     * ```
     */
    public toggle() {
        if (this.added) {
            return;
        }
        const grid = this.gridAPI.grid;
        this.endEdit(grid.rootGrid);
        this.gridAPI.set_row_expansion_state(this.realRowID, !this.expanded);
        grid.cdr.detectChanges();
    }

    /**
     * @hidden
     */
    @Input()
    @HostBinding('attr.aria-selected')
    get selected(): boolean {
        return this.selectionService.isRowSelected(this.realRowID);
    }

    /**
     * @hidden
     * @internal
     */
    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) { }

    /**
     * @hidden
     */
    public onRowSelectorClick(event) { }
}
