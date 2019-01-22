import { Component, Input, HostBinding } from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';

/**
 * The `<igx-drop-down-item>` is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
@Component({
    selector: 'igx-drop-down-item-group',
    template: `
        <label>{{ label }}</label>
        <ng-content></ng-content>
    `
})
export class IgxDropDownGroupComponent extends IgxDropDownItemBase {
    /** @hidden @internal */
    @HostBinding('class.igx-drop-down__group')
    get isHeader() {
        return true;
    }

    /** */
    @Input()
    public label: string;
}
