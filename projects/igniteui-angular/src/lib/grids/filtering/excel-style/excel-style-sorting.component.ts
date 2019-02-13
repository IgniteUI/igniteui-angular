import {
    Component,
    ChangeDetectionStrategy,
    AfterViewInit,
    ViewChild,
    Input
} from '@angular/core';
import { IgxColumnComponent } from '../../column.component';
import { IgxButtonGroupComponent } from '../../../buttonGroup/buttonGroup.component';
import { IgxFilteringService } from '../grid-filtering.service';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-sorting',
    templateUrl: './excel-style-sorting.component.html'
})
export class IgxExcelStyleSortingComponent implements AfterViewInit {

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor(private filteringService: IgxFilteringService) {}

    public ngAfterViewInit(): void {
        const se = this.column.grid.sortingExpressions.find(expr => expr.fieldName === this.column.field);
        if (se) {
            if (se.dir === 1) {
                this.sortButtonGroup.selectButton(0);
            } else {
                this.sortButtonGroup.selectButton(1);
            }
        }
    }
    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            this.filteringService.grid.clearSort(this.column.field);
        } else {
            this.filteringService.grid.sort({ fieldName: this.column.field, dir: sortDirection, ignoreCase: true });
        }
    }
}