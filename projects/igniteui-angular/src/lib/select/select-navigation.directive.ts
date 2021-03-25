import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectBase } from './select.common';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective implements OnDestroy {
    protected _target: IgxSelectBase = null;

    @Input('igxSelectItemNavigation')
    public get target(): IgxSelectBase {
        return this._target;
    }
    public set target(target: IgxSelectBase) {
        this._target = target ? target : this.dropdown as IgxSelectBase;
    }

    constructor() {
        super(null);
    }

    /** Captures keydown events and calls the appropriate handlers on the target component */
    public handleKeyDown(event: KeyboardEvent) {
        if (!event) {
            return;
        }

        const key = event.key.toLowerCase();
        if (event.altKey && (key === 'arrowdown' || key === 'arrowup' || key === 'down' || key === 'up')) {
            this.target.toggle();
            return;
        }

        if (this.target.collapsed) {
            switch (key) {
                case 'space':
                case 'spacebar':
                case ' ':
                case 'enter':
                    event.preventDefault();
                    this.target.open();
                    return;
                case 'arrowdown':
                case 'down':
                    this.target.navigateNext();
                    this.target.selectItem(this.target.focusedItem);
                    event.preventDefault();
                    return;
                case 'arrowup':
                case 'up':
                    this.target.navigatePrev();
                    this.target.selectItem(this.target.focusedItem);
                    event.preventDefault();
                    return;
                default:
                    break;
            }
        } else if (key === 'tab' || event.shiftKey && key === 'tab') {
            this.target.close();
        }

        super.handleKeyDown(event);
        this.captureKey(event);
    }

    /* eslint-disable @typescript-eslint/member-ordering */
    private inputStream = '';
    private clearStream$ = Subscription.EMPTY;

    public captureKey(event: KeyboardEvent) {
        // relying only on key, available on all major browsers:
        // https://caniuse.com/#feat=keyboardevent-key (IE/Edge quirk doesn't affect letter typing)
        if (!event || !event.key || event.key.length > 1 || event.key === ' ' || event.key === 'spacebar') {
            // ignore longer keys ('Alt', 'ArrowDown', etc) AND spacebar (used of open/close)
            return;
        }

        this.clearStream$.unsubscribe();
        this.clearStream$ = timer(500).subscribe(() => {
            this.inputStream = '';
        });

        this.inputStream += event.key;
        const focusedItem = this.target.focusedItem as IgxSelectItemComponent;

        // select the item
        if (focusedItem && this.inputStream.length > 1 && focusedItem.itemText.toLowerCase().startsWith(this.inputStream.toLowerCase())) {
            return;
        }
        this.activateItemByText(this.inputStream);
    }

    public activateItemByText(text: string) {
        const items = this.target.items as IgxSelectItemComponent[];

        // ^ this is focused OR selected if the dd is closed

        let nextItem = this.findNextItem(items, text);

        // If there is no such an item starting with the current text input stream AND the last Char in the input stream
        // is the same as the first one, find next item starting with the same first Char.
        // Covers cases of holding down the same key Ex: "pppppp" that iterates trough list items starting with "p".
        if (!nextItem && text.charAt(0) === text.charAt(text.length - 1)) {
            text = text.slice(0, 1);
            nextItem = this.findNextItem(items, text);
        }

        // If there is no other item to be found, do not change the active item.
        if (!nextItem) {
            return;
        }

        if (this.target.collapsed) {
            this.target.selectItem(nextItem);
        }
        this.target.navigateItem(items.indexOf(nextItem));
    }

    public ngOnDestroy(): void {
        this.clearStream$.unsubscribe();
    }

    private findNextItem(items: IgxSelectItemComponent[],  text: string) {
        const activeItemIndex = items.indexOf(this.target.focusedItem as IgxSelectItemComponent) || 0;

        // Match next item in ddl items and wrap around if needed
        return items.slice(activeItemIndex + 1).find(x => !x.disabled && (x.itemText.toLowerCase().startsWith(text.toLowerCase()))) ||
            items.slice(0, activeItemIndex).find(x => !x.disabled && (x.itemText.toLowerCase().startsWith(text.toLowerCase())));
    }
}
