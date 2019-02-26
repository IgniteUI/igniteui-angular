import { Component } from '@angular/core';
import { IgxDropDownComponent, IgxDropDownItemBase } from '../../../drop-down';
import { IGX_DROPDOWN_BASE } from '../../../drop-down/drop-down.common';

/**
 * @hidden
 */
@Component({
    selector: 'igx-excel-style-drop-down',
    templateUrl: '../../../drop-down/drop-down.component.html',
    providers: [{ provide: IGX_DROPDOWN_BASE, useExisting: IgxExcelStyleDropDownComponent }]
})
export class IgxExcelStyleDropDownComponent extends IgxDropDownComponent {
    // TODO: remove this class once the drow down supports igxFor virtualization
    protected scrollToItem(item: IgxDropDownItemBase) {
        return;
    }
}
