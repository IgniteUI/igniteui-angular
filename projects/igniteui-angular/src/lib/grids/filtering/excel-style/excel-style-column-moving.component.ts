import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilteringService } from '../grid-filtering.service';
import { IgxGridBaseComponent } from '../../grid';

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

    get canMoveLeft() {
        return !this.column.movable || this.column.visibleIndex === 0;
    }

    get canMoveRight() {
        return !this.column.movable || this.column.visibleIndex === this.grid.columns.length - 1;
    }

    public onMoveButtonClicked(moveDirection) {
        const index = this.column.visibleIndex;
        this.grid.moveColumn(this.column, this.grid.columns[index + moveDirection]);
    }
}