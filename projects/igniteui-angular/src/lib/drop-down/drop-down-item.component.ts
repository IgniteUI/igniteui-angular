import {
    Component,
    DoCheck,
    HostListener,
    HostBinding
} from '@angular/core';
import { IgxDropDownItemBase } from './drop-down-item.base';

/**
 * The `<igx-drop-down-item>` is a container intended for row items in
 * a `<igx-drop-down>` container.
 */
@Component({
    selector: 'igx-drop-down-item',
    templateUrl: 'drop-down-item.component.html'
})
export class IgxDropDownItemComponent extends IgxDropDownItemBase implements DoCheck {
    /**
     * @inheritdoc
     */
    get focused(): boolean {
        const focusedState = this._index !== null && this._index !== undefined
        ? this._index === this.selection.first_item(`${this.dropDown.id}-active`) : this._focused;
        return !this.isHeader && !this.disabled && focusedState;
    }

    /**
     * @inheritdoc
     */
    set focused(value: boolean) {
        this._focused = value;
    }
    /**
     * @inheritdoc
     */
    get selected(): boolean {
        if (this._index) {
            const item = this.dropDown.selectedItem;
            return item ? item.index === this._index && item.value === this.value : false;
        }
        return this._selected;
    }

    /**
     * @inheritdoc
     */
    set selected(value: boolean) {
        if (this.isHeader) {
            return;
        }
        this._selected = value;
    }
    /**
     * @hidden @internal
     */
    @HostBinding('attr.tabindex')
    get setTabIndex() {
        const shouldSetTabIndex = this.dropDown.allowItemsFocus && !(this.disabled || this.isHeader);
        if (shouldSetTabIndex) {
            return 0;
        } else {
            return null;
        }
    }

    /**
     * @hidden @internal
     */
    @HostListener('click', ['$event'])
    clicked(event) {
        if (this.disabled || this.isHeader) {
            const focusedItem = this.dropDown.items.find((item) => item.focused);
            if (this.dropDown.allowItemsFocus && focusedItem) {
                focusedItem.element.nativeElement.focus({ preventScroll: true });
            }
            return;
        }
        if (this.selection) {
            this.dropDown.selectItem(this, event);
        }
    }
}
