import { Component } from '@angular/core';
import { IgxDropDownGroupComponent } from 'igniteui-angular/drop-down';

/**
 * The `<igx-select-item>` is a container intended for row items in
 * a `<igx-select>` container.
 */
@Component({
    selector: 'igx-select-item-group',
    template: `
        <label id="{{labelId}}">{{ label }}</label>
        <ng-content select="igx-select-item"></ng-content>
    `,
    // Items inject their group as IgxDropDownGroupComponent, a token a subclass does not match by itself.
    providers: [{ provide: IgxDropDownGroupComponent, useExisting: IgxSelectGroupComponent }]
})
export class IgxSelectGroupComponent extends IgxDropDownGroupComponent {
}
