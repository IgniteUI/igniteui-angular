import {
    Component,
    ChangeDetectionStrategy,
    Input,
    OnDestroy
} from '@angular/core';
import { IgxColumnComponent } from '../../columns/column.component';
import { Subject } from 'rxjs';
import { GridType } from '../../common/grid.interface';
import { GridSelectionMode } from '../../common/enums';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-selecting',
    templateUrl: './excel-style-selecting.component.html'
})
export class IgxExcelStyleSelectingComponent implements OnDestroy {
    private destroy$ = new Subject<boolean>();

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public grid: GridType;

    constructor() {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /**
     * @hidden @internal
     */
    public selectedClass() {
        return this.column.selected ? 'igx-excel-filter__actions-selected' : 'igx-excel-filter__actions-select';
    }

    /**
     * @hidden @internal
     */
    public onSelect() {
        if (!this.column.selected) {
            this.column.grid.selectionService.selectColumn(this.column.field,
                this.column.grid.columnSelection === GridSelectionMode.single);
        } else {
            this.column.grid.selectionService.deselectColumn(this.column.field);
        }
        this.column.grid.notifyChanges();
    }
}
