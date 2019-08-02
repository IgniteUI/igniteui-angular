import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../../column.component';
import { IgxGridBaseComponent } from '../../grid-base.component';
import { DisplayDensity } from '../../../core/density';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-column-moving',
    templateUrl: './excel-style-column-moving.component.html'
})
export class IgxExcelStyleColumnMovingComponent {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public grid: IgxGridBaseComponent;

    @Input()
    public displayDensity: DisplayDensity;

    @Input()
    public isColumnPinnable: boolean;

    constructor() {}

    private get visibleColumns() {
        return this.grid.visibleColumns.filter(col => !(col instanceof IgxColumnGroupComponent));
    }

    get canNotMoveLeft() {
        return this.column.visibleIndex === 0 ||
            (this.grid.unpinnedColumns.indexOf(this.column) === 0 && this.column.disablePinning) ||
            (this.grid.unpinnedColumns.indexOf(this.column) === 0 && !this.isColumnPinnable) ||
            (this.column.level !== 0 && !this.findColumn(0, this.visibleColumns));
    }

    get canNotMoveRight() {
        return this.column.visibleIndex === this.visibleColumns.length - 1 ||
            (this.column.level !== 0 && !this.findColumn(1, this.visibleColumns));
    }

    public onMoveButtonClicked(moveDirection) {
        let targetColumn;
        if (this.column.pinned) {
            if (this.column.isLastPinned && moveDirection === 1) {
                targetColumn = this.grid.unpinnedColumns[0];
                moveDirection = 0;
            } else {
                targetColumn = this.findColumn(moveDirection, this.grid.pinnedColumns);
            }
        } else if (this.grid.unpinnedColumns.indexOf(this.column) === 0 && moveDirection === 0) {
            targetColumn = this.grid.pinnedColumns[this.grid.pinnedColumns.length - 1];
            moveDirection = 1;
        } else {
            targetColumn = this.findColumn(moveDirection, this.grid.unpinnedColumns);
        }
        this.grid.moveColumn(this.column, targetColumn, moveDirection);
    }

    private findColumn(moveDirection: number, columns: IgxColumnComponent[]) {
        let index = columns.indexOf(this.column);
        if (moveDirection === 0) {
            while (index > 0) {
                index--;
                if (columns[index].level === this.column.level && columns[index].parent === this.column.parent) {
                    return columns[index];
                }
            }
        } else {
            while (index < columns.length - 1) {
                index++;
                if (columns[index].level === this.column.level && columns[index].parent === this.column.parent) {
                    return columns[index];
                }
            }
        }
    }
}
