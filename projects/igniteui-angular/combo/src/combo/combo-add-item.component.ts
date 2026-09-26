import { IgxComboItemComponent } from './combo-item.component';
import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.igx-drop-down__item]': 'isDropDownItem'
    },
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent }],
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    public get isDropDownItem(): boolean {
        return false;
    }

    public override get selected(): boolean {
        return false;
    }
    public override set selected(value: boolean) {
    }

    public override clicked(_event?: MouseEvent) {
        this.comboAPI.disableTransitions = false;
        this.comboAPI.add_custom_item();
    }
}
