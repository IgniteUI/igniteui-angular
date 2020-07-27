import {
    Component,
    OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * @hidden
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html'
})
export class IgxExcelStyleHidingComponent implements OnDestroy {
    private destroy$ = new Subject<boolean>();

    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
