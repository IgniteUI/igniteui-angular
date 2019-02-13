import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, HostListener, OnDestroy } from '@angular/core';
import { IgxSelectComponent } from './select.component';
import { Subscription, timer } from 'rxjs';
import { IgxSelectItemComponent } from './select-item.component';

/** @hidden @internal */
@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective implements OnDestroy {

    @Input('igxSelectItemNavigation')
    public target: IgxSelectComponent;

    constructor() { super(null); }

    handleKeyDown(event: KeyboardEvent) {
        if (!event || event.shiftKey) {
            return;
        }
        const key = event.key.toLowerCase();

        if (event.altKey && (key === 'arrowdown' || key === 'arrowup')) {
            this.target.toggle();
            return;
        }

        if (this.target.collapsed) {
            switch (key) {
                case 'enter':
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.open();
                    return;
                case 'arrowdown':
                    if (this.target.collapsed) {
                        this.target.navigateNext();
                        this.target.selectItem(this.target.focusedItem);
                    }
                    event.preventDefault();
                    return;
                case 'arrowup':
                    if (this.target.collapsed) {
                        this.target.navigatePrev();
                        this.target.selectItem(this.target.focusedItem);
                    }
                    event.preventDefault();
                    return;
                default:
                    break;
            }
        }

        if (!this.target.collapsed && (key === 'tab' || key === ' ')) {
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
