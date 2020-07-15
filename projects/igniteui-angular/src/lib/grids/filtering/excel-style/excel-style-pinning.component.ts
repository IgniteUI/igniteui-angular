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
    selector: 'igx-excel-style-pinning',
    templateUrl: './excel-style-pinning.component.html'
})
export class IgxExcelStylePinningComponent implements OnDestroy {
    private destroy$ = new Subject<boolean>();

    @Input()
    public column: IgxColumnComponent;

    @Input()
    public grid: GridType;

    @Input()
    public isColumnPinnable: boolean;

    constructor() {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    public onPin() {
        this.column.pinned = !this.column.pinned;
        // this.closeDropdown();
    }

    public pinClass() {
        return this.isColumnPinnable ? 'igx-excel-filter__actions-pin' : 'igx-excel-filter__actions-pin--disabled';
    }
}
