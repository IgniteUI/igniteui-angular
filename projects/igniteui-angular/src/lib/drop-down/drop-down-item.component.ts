import {
    Component,
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
export class IgxDropDownItemComponent extends IgxDropDownItemBase {
    /**
     * @inheritdoc
     */
    get focused(): boolean {
        let focusedState = this._focused;
        if (this.hasIndex) {
            const focusedItem = this.selection.first_item(`${this.dropDown.id}-active`);
            const focusedIndex = focusedItem ? focusedItem.index : -1;
            focusedState = this._index === focusedIndex;
        }
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
        if (this.hasIndex) {
            const item = this.selection.first_item(`${this.dropDown.id}`);
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
        this.selectedChange.emit(this._selected);
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

    /**
     * @hidden @internal
     */
    @HostListener('mousedown', ['$event'])
    mousedownHandler(event) {
        event.preventDefault();
    }
}
