import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, HostListener, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectBase } from './select.common';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective implements OnDestroy {

    @Input('igxSelectItemNavigation')
    public target: IgxSelectBase;

    constructor() { super(null); }

    /** Captures keydown events and calls the appropriate handlers on the target component */
    handleKeyDown(event: KeyboardEvent) {
        if (!event || event.shiftKey) {
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
                    event.preventDefault();
                /* falls through */
                case 'enter':
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
        }

        if (!this.target.collapsed && (key === 'tab')) {
            this.target.close();
            return;
        }
        super.handleKeyDown(event);
    }

    // tslint:disable:member-ordering
    private inputStream = '';
    private clearStream$ = Subscription.EMPTY;

    /** Handle continuous letter typing navigation */
    @HostListener('keyup', ['$event'])
    public captureKey(event: KeyboardEvent) {
        // relying only on key, available on all major browsers:
        // https://caniuse.com/#feat=keyboardevent-key (IE/Edge quirk doesn't affect letter typing)
        if (!event || !event.key || event.key.length > 1) {
            // ignore longer keys ('Alt', 'ArrowDown', etc)
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
        const activeItemIndex = items.indexOf(this.target.focusedItem as IgxSelectItemComponent) || 0;
        // ^ this is focused OR selected if the dd is closed
        let nextItem = items.slice(activeItemIndex + 1).find(x => !x.disabled && (x.itemText.toLowerCase().startsWith(text.toLowerCase())));

        if (!nextItem) {
            nextItem = items.slice(0, activeItemIndex).find(x => !x.disabled && (x.itemText.toLowerCase().startsWith(text.toLowerCase())));
        }

        if (!nextItem) {
            return;
        }

        if (this.target.collapsed) {
            this.target.selectItem(nextItem);
        }
        this.target.navigateItem(items.indexOf(nextItem));
    }

    ngOnDestroy(): void {
        this.clearStream$.unsubscribe();
    }
}
