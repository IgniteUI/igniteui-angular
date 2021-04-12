import { Component } from '@angular/core';
import { PlatformUtil } from '../../../core/utils';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * A component used for presenting Excel style clear filters UI.
 */
@Component({
    selector: 'igx-excel-style-clear-filters',
    templateUrl: './excel-style-clear-filters.component.html'
})
export class IgxExcelStyleClearFiltersComponent {
    constructor(public esf: IgxGridExcelStyleFilteringComponent, protected platform: PlatformUtil) { }

    /**
     * @hidden @internal
     */
    public clearFilterClass() {
        if (this.esf.column.filteringExpressionsTree) {
            return 'igx-excel-filter__actions-clear';
        }

        return 'igx-excel-filter__actions-clear--disabled';
    }

    /**
     * @hidden @internal
     */
    public clearFilter() {
        this.esf.grid.filteringService.clearFilter(this.esf.column.field);
        this.selectAllFilterItems();
    }

    /**
     * @hidden @internal
     */
    public onClearFilterKeyDown(eventArgs: KeyboardEvent) {
        if (eventArgs.key === this.platform.KEYMAP.ENTER) {
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
