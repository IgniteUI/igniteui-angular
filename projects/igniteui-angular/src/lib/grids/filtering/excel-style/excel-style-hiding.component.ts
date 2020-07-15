import {
    Component,
    ChangeDetectionStrategy,
    Input,
    OnDestroy
} from '@angular/core';
import { IgxColumnComponent } from '../../columns/column.component';
import { Subject } from 'rxjs';
import { GridType } from '../../common/grid.interface';

/**
 * @hidden
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html'
})
export class IgxExcelStyleHidingComponent implements OnDestroy {
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
    public onHideToggle() {
        this.column.hidden = !this.column.hidden;
        this.column.grid.onColumnVisibilityChanged.emit({ column: this.column, newValue: this.column.hidden });
        // this.closeDropdown();
    }
}
