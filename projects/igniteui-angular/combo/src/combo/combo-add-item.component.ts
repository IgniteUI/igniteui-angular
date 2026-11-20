import { IgxComboItemComponent } from './combo-item.component';
import { Component, HostBinding, Input, booleanAttribute } from '@angular/core';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    template: '<ng-content></ng-content>',
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent }],
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    /**
     * @hidden @internal
     * Set when the add item renders a custom `igxComboAddItem` template instead of the default button.
     */
    @Input({ transform: booleanAttribute })
    public customTemplate = false;

    @HostBinding('class.igx-drop-down__item')
    public get isDropDownItem(): boolean {
        return false;
    }

    /**
     * @hidden @internal
     * Whether the add item is the active entry of the list. The focus stays on the list,
     * so the default button shows this state as its own focus state.
     */
    public get active(): boolean {
        return super.focused;
    }

    /**
     * @hidden @internal
     * The default add item is a button that shows its own focus state, so it does not take
     * the focus style of the list items. A custom template keeps that style.
     */
    public override get focused(): boolean {
        return this.customTemplate && super.focused;
    }

    public override set focused(value: boolean) {
        super.focused = value;
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
