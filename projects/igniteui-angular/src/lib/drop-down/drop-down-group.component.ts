import { Component, Input } from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';

/**
 * The `<igx-drop-down-item>` is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
@Component({
    selector: 'igx-drop-down-group',
    template: `
        <label>{{ header }}</label>
        <ng-content></ng-content>
    `,
    styles: [`:host.igx-drop-down__header { flex-flow: column; align-items: baseline; }`]
})
export class IgxDropDownGroupComponent extends IgxDropDownItemBase {
    /** @hidden */
    get isHeader() {
        return true;
    }

    /** */
    @Input()
    public header: string;
}
