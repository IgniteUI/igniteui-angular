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
export class IgxExcelStyleSortingComponent {

    @Input()
    public column: IgxColumnComponent;

    @ViewChild('sortButtonGroup', { read: IgxButtonGroupComponent })
    public sortButtonGroup: IgxButtonGroupComponent;

    constructor(private filteringService: IgxFilteringService) {}

    public onSortButtonClicked(sortDirection) {
        if (this.sortButtonGroup.selectedIndexes.length === 0) {
            this.filteringService.grid.clearSort(this.column.field);
        } else {
            this.filteringService.grid.sort({ fieldName: this.column.field, dir: sortDirection, ignoreCase: true });
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