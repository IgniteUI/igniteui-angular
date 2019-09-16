import { Directive } from '@angular/core';
import { ColumnChooserItemBase } from '../column-chooser-item-base';


@Directive({
    selector: '[igxColumnPinningItem]'
})
export class IgxColumnPinningItemDirective extends ColumnChooserItemBase {

    constructor() {
        super('pinned');
    }

    /**
     * Returns whether a column could be pinned.
     * It's not possible to pin a column if there is not enough space for the unpinned area.
     * ```typescript
     * const columnItem: IgxColumnPinningItemDirective;
     * this.columnItem.pinnable;
     * ```
     */
    get pinnable() {
        return this.column.pinnable;
    }
}
