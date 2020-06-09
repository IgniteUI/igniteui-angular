import { Component } from '@angular/core';
import { IgxDropDownGroupComponent } from '../drop-down/public_api';

/**
 * The `<igx-select-item>` is a container intended for row items in
 * a `<igx-select>` container.
 */
@Component({
    selector: 'igx-select-item-group',
    template: `
        <label id="{{labelId}}">{{ label }}</label>
        <ng-content select="igx-select-item"></ng-content>
    `
})
export class IgxSelectGroupComponent extends IgxDropDownGroupComponent {
}
