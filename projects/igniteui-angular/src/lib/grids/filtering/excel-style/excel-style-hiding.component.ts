import {
    Component
} from '@angular/core';
import { IgxGridExcelStyleFilteringComponent } from './grid.excel-style-filtering.component';

/**
 * A component used for presenting Excel style column hiding UI.
 */
@Component({
    preserveWhitespaces: false,
    selector: 'igx-excel-style-hiding',
    templateUrl: './excel-style-hiding.component.html'
})
export class IgxExcelStyleHidingComponent {
    constructor(public esf: IgxGridExcelStyleFilteringComponent) { }
}
