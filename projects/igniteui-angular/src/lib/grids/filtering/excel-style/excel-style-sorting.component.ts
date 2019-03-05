import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    Input
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxGridBaseComponent, IgxGridComponent } from '../../grid';

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
    public grid: IgxGridBaseComponent;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor() {}

    public onSortButtonClicked(sortDirection) {
        let isColumnGrouped;
        if (this.grid instanceof IgxGridComponent) {
            isColumnGrouped = (this.grid as IgxGridComponent).groupingExpressions.find(exp => exp.fieldName === this.column.field);
        }
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            if (isColumnGrouped) {
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
