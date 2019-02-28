import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
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

    get canNotMoveLeft() {
        return !this.column.movable || this.column.visibleIndex === 0 ||
            (this.grid.unpinnedColumns.indexOf(this.column) === 0 && this.column.disablePinning);
    }

    get canNotMoveRight() {
        return !this.column.movable || this.column.visibleIndex === this.grid.columns.length - 1;
    }

    public onMoveButtonClicked(moveDirection) {
        let index;
        let position = moveDirection === 1 ? 1 : 0;
        let targetColumn;

        if (this.column.pinned) {
            if (this.column.isLastPinned && moveDirection === 1) {
                targetColumn = this.grid.unpinnedColumns[0];
                position = 0;
            } else {
                index = this.grid.pinnedColumns.indexOf(this.column);
                targetColumn = this.grid.pinnedColumns[index + moveDirection];
            }
        } else if (this.grid.unpinnedColumns.indexOf(this.column) === 0 && moveDirection === -1) {
            targetColumn = this.grid.pinnedColumns[this.grid.pinnedColumns.length - 1];
            position = 1;
        } else {
            index = this.grid.unpinnedColumns.indexOf(this.column);
            targetColumn = this.grid.unpinnedColumns[index + moveDirection];
        }
        this.grid.moveColumn(this.column, targetColumn, position);
    }
}
