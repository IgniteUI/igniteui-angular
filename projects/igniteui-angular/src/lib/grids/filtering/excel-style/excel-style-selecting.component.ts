import {
    Component,
    ChangeDetectionStrategy,
    OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

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

    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
