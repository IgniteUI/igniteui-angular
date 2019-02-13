import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxFilteringService } from '../grid-filtering.service';

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

    constructor(private filteringService: IgxFilteringService) {}

    get canMoveLeft() {
        return !this.column.movable || this.column.visibleIndex === 0;
    }

    get canMoveRigth() {
        return !this.column.movable || this.column.visibleIndex === this.filteringService.grid.columns.length - 1;
    }

    public onMoveButtonClicked(moveDirection) {
        const index = this.column.visibleIndex;
        this.filteringService.grid.moveColumn(this.column, this.filteringService.grid.columns[index + moveDirection]);
    }
}