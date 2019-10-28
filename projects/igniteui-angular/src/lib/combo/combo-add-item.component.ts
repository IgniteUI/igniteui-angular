import { IgxComboItemComponent } from './combo-item.component';
import { Component, HostListener } from '@angular/core';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent}]
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    get selected(): boolean {
        return false;
    }
    set selected(value: boolean) {
    }

    /**
     * @hidden
     * @internal
     * This is related to https://github.com/angular/angular/issues/33300
     * When the above is fixed, we can remove the @HostListener decorator and move
     * the body of the `handleClick` method back under `clicked`
     */
    @HostListener('click')
    handleClick() {
        this.comboAPI.disableTransitions = false;
        this.comboAPI.add_custom_item();
    }

    clicked(event?) {
    }
}
