import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    Input
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-sorting',
    templateUrl: './excel-style-sorting.component.html'
})
export class IgxExcelStyleSortingComponent {

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public grid: any;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor() {}

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            if (this.grid.isColumnGrouped(this.column.field)) {
                this.selectButton(sortDirection);
            } else {
                this.grid.clearSort(this.column.field);
            }
        } else {
            this.grid.sort({ fieldName: this.column.field, dir: sortDirection, ignoreCase: true });
        }
    }

    public selectButton(sortDirection: number) {
        if (sortDirection === 1) {
            this.sortButtonGroup.selectButton(0);
        } else {
            this.sortButtonGroup.selectButton(1);
        }
    }
}
