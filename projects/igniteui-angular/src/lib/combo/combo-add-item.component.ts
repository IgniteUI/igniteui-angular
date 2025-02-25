import { IgxComboItemComponent } from './combo-item.component';
import { Component, HostBinding } from '@angular/core';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent }],
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    @HostBinding('class.igx-drop-down__item')
    public get isDropDownItem(): boolean {
        return false;
    }

    public override get selected(): boolean {
        return false;
    }
    public override set selected(value: boolean) {
    }

    public override clicked(event?) {// eslint-disable-line
        this.comboAPI.disableTransitions = false;
        this.comboAPI.add_custom_item();
    }
}
