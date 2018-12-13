import { IgxComboItemComponent } from './combo-item.component';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxComboItemComponent, useClass: IgxComboAddItemComponent}]
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    /**
     * Gets the height of a list item
     * @hidden
     */
    @Input()
    @HostBinding('style.height.px')
    public itemHeight = '';

    get isSelected(): boolean {
        return false;
    }
    set isSelected(value: boolean) {
    }

    clicked() {
        this.combo.addItemToCollection();
    }
}
