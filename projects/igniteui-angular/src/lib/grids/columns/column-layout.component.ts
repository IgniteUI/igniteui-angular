import {
    AfterContentInit,
    Component,
    ChangeDetectionStrategy,
    forwardRef,
    Input
} from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxColumnGroupComponent } from './column-group.component';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: IgxColumnComponent, useExisting: forwardRef(() => IgxColumnLayoutComponent) }],
    selector: 'igx-column-layout',
    template: ``
})
export class IgxColumnLayoutComponent extends IgxColumnGroupComponent implements AfterContentInit {
    public childrenVisibleIndexes = [];
    /**
     * Gets the width of the column layout.
     * ```typescript
     * let columnGroupWidth = this.columnGroup.width;
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public get width(): any {
        const width = this.getFilledChildColumnSizes(this.children).reduce((acc, val) => acc + parseInt(val, 10), 0);
        return width;
    }

    public set width(val: any) { }

    public get columnLayout() {
        return true;
    }

    /**
     * @hidden
     */
    public getCalcWidth(): any {
        let borderWidth = 0;

        if (this.headerGroup && this.headerGroup.hasLastPinnedChildColumn) {
            const headerStyles = this.grid.document.defaultView.getComputedStyle(this.headerGroup.nativeElement.children[0]);
            borderWidth = parseInt(headerStyles.borderRightWidth, 10);
        }

        return super.getCalcWidth() + borderWidth;
    }

    /**
     * Gets the column visible index.
     * If the column is not visible, returns `-1`.
     * ```typescript
     * let visibleColumnIndex =  this.column.visibleIndex;
     * ```
     *
     * @memberof IgxColumnComponent
     */
    public get visibleIndex(): number {
        if (!isNaN(this._vIndex)) {
            return this._vIndex;
        }

        const unpinnedColumns = this.grid.unpinnedColumns.filter(c => c.columnLayout && !c.hidden);
        const pinnedColumns = this.grid.pinnedColumns.filter(c => c.columnLayout && !c.hidden);
        let vIndex = -1;

        if (!this.pinned) {
            const indexInCollection = unpinnedColumns.indexOf(this);
            vIndex = indexInCollection === -1 ? -1 : pinnedColumns.length + indexInCollection;
        } else {
            vIndex = pinnedColumns.indexOf(this);
        }
        this._vIndex = vIndex;
        return vIndex;
    }

    /*
     * Gets whether the column layout is hidden.
     * ```typescript
     * let isHidden = this.columnGroup.hidden;
     * ```
     * @memberof IgxColumnGroupComponent
     */
    @Input()
    public get hidden() {
        return this._hidden;
    }

    /**
     * Sets the column layout hidden property.
     * ```typescript
     * <igx-column-layout [hidden] = "true"></igx-column->
     * ```
     *
     * @memberof IgxColumnGroupComponent
     */
    public set hidden(value: boolean) {
        this._hidden = value;
        this.children.forEach(child => child.hidden = value);
        if (this.grid && this.grid.columns && this.grid.columns.length > 0) {
            // reset indexes in case columns are hidden/shown runtime
            const columns = this.grid && this.grid.pinnedColumns && this.grid.unpinnedColumns ?
            this.grid.pinnedColumns.concat(this.grid.unpinnedColumns) : [];
            if (!this._hidden && !columns.find(c => c.field === this.field)) {
                this.grid.resetColumnCollections();
            }
            this.grid.columns.filter(x => x.columnLayout).forEach(x => x.populateVisibleIndexes());
        }
    }

    /**
     * @hidden
     */
    public ngAfterContentInit() {
        super.ngAfterContentInit();
        if (!this.hidden) {
            this.hidden = this.allChildren.some(x => x.hidden);
        } else {
            this.children.forEach(child => child.hidden = this.hidden);
        }

        this.children.forEach(child => {
            child.movable = false;
        });
    }

    /*
     * Gets whether the group contains the last pinned child column of the column layout.
     * ```typescript
     * let columsHasLastPinned = this.columnLayout.hasLastPinnedChildColumn;
     * ```
     * @memberof IgxColumnLayoutComponent
     */
    public get hasLastPinnedChildColumn() {
        return this.children.some(child => child.isLastPinned);
    }

    /*
     * Gets whether the group contains the first pinned child column of the column layout.
     * ```typescript
     * let hasFirstPinnedChildColumn = this.columnLayout.hasFirstPinnedChildColumn;
     * ```
     * @memberof IgxColumnLayoutComponent
     */
    public get hasFirstPinnedChildColumn() {
        return this.children.some(child => child.isFirstPinned);
    }

    /**
     * @hidden
     */
    public populateVisibleIndexes() {
        this.childrenVisibleIndexes = [];
        const grid = this.gridAPI.grid;
        const columns = grid && grid.pinnedColumns && grid.unpinnedColumns ? grid.pinnedColumns.concat(grid.unpinnedColumns) : [];
        const orderedCols = columns
            .filter(x => !x.columnGroup && !x.hidden)
            .sort((a, b) => a.rowStart - b.rowStart || columns.indexOf(a.parent) - columns.indexOf(b.parent) || a.colStart - b.colStart);
        this.children.forEach(child => {
            const rs = child.rowStart || 1;
            let vIndex = 0;
            // filter out all cols with larger rowStart
            const cols = orderedCols.filter(c =>
                !c.columnGroup && (c.rowStart || 1) <= rs);
            vIndex = cols.indexOf(child);
            this.childrenVisibleIndexes.push({ column: child, index: vIndex });
        });
    }
}
