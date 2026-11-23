import { IgxComboItemComponent } from './combo-item.component';
import { Component, HostBinding, ChangeDetectionStrategy, Input, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IgxButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';

/**
 * @hidden
 */
@Component({
    selector: 'igx-combo-add-item',
    templateUrl: 'combo-add-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [{ provide: IgxComboItemComponent, useExisting: IgxComboAddItemComponent }],
    imports: [NgTemplateOutlet, IgxButtonDirective, IgxRippleDirective]
})
export class IgxComboAddItemComponent extends IgxComboItemComponent {
    /**
     * @hidden @internal
     * The custom `igxComboAddItem` template, rendered instead of the default button.
     *
     * @example
     * ```html
     * <igx-combo-add-item [template]="addItemTemplate"></igx-combo-add-item>
     * ```
     */
    @Input()
    public template: TemplateRef<any> | null = null;

    /**
     * @hidden @internal
     * The text of the default button.
     *
     * @example
     * ```html
     * <igx-combo-add-item [label]="resourceStrings.igx_combo_addCustomValues_placeholder"></igx-combo-add-item>
     * ```
     */
    @Input()
    public label = '';

    @HostBinding('class.igx-drop-down__item')
    public get isDropDownItem(): boolean {
        return false;
    }

    /**
     * @hidden @internal
     * Whether the add item is the active entry of the list. The focus stays on the list,
     * so the default button shows this state as its own focus state.
     *
     * @returns `true` when the drop-down's active entry is the add item.
     *
     * @example
     * ```html
     * <button igxButton="flat" [focusVisible]="active"></button>
     * ```
     */
    public get active(): boolean {
        return this.dropDown.focusedItem === this;
    }

    /**
     * @hidden @internal
     * The default add item is a button that shows its own focus state, so it does not take
     * the focus style of the list items. A custom template keeps that style.
     */
    public override get focused(): boolean {
        return !!this.template && this.active;
    }

    public override set focused(value: boolean) {
        super.focused = value;
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
