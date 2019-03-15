import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxColumnComponent, IgxColumnGroupComponent } from '../../column.component';
import { IgxGridBaseComponent } from '../../grid-base.component';

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

    constructor() {}

    private get visibleColumns() {
        return this.grid.visibleColumns.filter(col => !(col instanceof IgxColumnGroupComponent));
    }

    get canNotMoveLeft() {
        const prevIndex = this.grid.columns.indexOf(this.column) - 1;
        return this.column.visibleIndex === 0 ||
            (this.grid.unpinnedColumns.indexOf(this.column) === 0 && this.column.disablePinning) ||
            (this.column.level !== 0 && this.grid.columns[prevIndex] && this.grid.columns[prevIndex].level !== this.column.level);
    }

    get canNotMoveRight() {
        const nextIndex = this.grid.columns.indexOf(this.column) + 1;
        return this.column.visibleIndex === this.visibleColumns.length - 1 ||
            (this.column.level !== 0 && this.grid.columns[nextIndex] && this.grid.columns[nextIndex].level !== this.column.level);
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
            return columns[index + 1];
        }
    }
}
