import {
    Component,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { KEYS } from '../../../core/utils';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-clear-filters',
    templateUrl: './excel-style-clear-filters.component.html'
})
export class IgxExcelStyleClearFiltersComponent implements OnDestroy {
    private destroy$ = new Subject<boolean>();

    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public clearFilterClass() {
        if (this.esf.column.filteringExpressionsTree) {
            return 'igx-excel-filter__actions-clear';
        }

        return 'igx-excel-filter__actions-clear--disabled';
    }

    public clearFilter() {
        this.esf.grid.filteringService.clearFilter(this.esf.column.field);
        this.selectAllFilterItems();
    }

    public onClearFilterKeyDown(eventArgs) {
        if (eventArgs.key === KEYS.ENTER) {
            this.clearFilter();
        }
    }

    private selectAllFilterItems() {
        this.esf.listData.forEach(filterListItem => {
            filterListItem.isSelected = true;
            filterListItem.indeterminate = false;
        });
        this.esf.detectChanges();
    }
}
