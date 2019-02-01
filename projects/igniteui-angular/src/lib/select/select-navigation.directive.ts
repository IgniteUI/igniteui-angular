import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, HostListener } from '@angular/core';
import { IgxSelectComponent } from './select.component';
import { Subscription, timer } from 'rxjs';
import { IgxSelectItemComponent } from './select-item.component';

@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective {
    @Input('igxSelectItemNavigation')
    public target: IgxSelectComponent;

    constructor() { super(null); }

    handleKeyDown(event: KeyboardEvent) {
        if (!event || event.shiftKey) {
            return;
        }
        const key = event.key.toLowerCase();

        if (event.altKey) {
            switch (key) {
                case 'arrowdown':
                    this.target.toggle();
                    return;
                case 'arrowup':
                    this.target.toggle();
                    return;
                default:
                    break;
            }
        }

        if (this.target.collapsed) {
            switch (key) {
                case 'enter':
                    this.target.open();
                    return;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.open();
                    return;
                case 'arrowdown':
                    if (this.target.collapsed) {
                        const selectedItemIndex = this.target.selectedItem.index;
                        let nextItem = this.target.items[selectedItemIndex + 1] ?
                            this.target.items[selectedItemIndex + 1] : this.target.items[selectedItemIndex];
                        if (nextItem.disabled) {
                            nextItem = this.target.items[nextItem.index + 1];
                        }
                        if (nextItem) {
                            this.target.selectItem(nextItem);
                            this.target.navigateItem(nextItem.index);
                        }
                    }
                    event.preventDefault();
                    return;
                case 'arrowup':
                    if (this.target.collapsed) {
                        const selectedItemIndex = this.target.selectedItem.index;
                        let previousItem = this.target.items[selectedItemIndex - 1] ?
                            this.target.items[selectedItemIndex - 1] : this.target.items[selectedItemIndex - 0];
                        if (previousItem.disabled) {
                            previousItem = this.target.items[previousItem.index - 1];
                        }
                        if (previousItem) {
                            this.target.selectItem(previousItem);
                            this.target.navigateItem(previousItem.index);
                        }
                    }
                    event.preventDefault();
                    return;
                default:
                    break;
            }
        }

        if (!this.target.collapsed && key === 'tab') {
            this.target.close();
        }
        super.handleKeyDown(event);
    }

    // tslint:disable:member-ordering
    private inputStream = '';
    private cancelSub$: Subscription;

    // Key listeners go here //TODO DO NOT BLOCK OTHER KEY INTERACTIONS (handleKeyDown)
    @HostListener('keyup', ['$event'])
    public captureKey(event: KeyboardEvent) {
        if (!event) {
            return;
        }
        this.inputStream += event.key;
        const focusedItem = this.target.focusedItem as IgxSelectItemComponent;
        // select the item
        if (focusedItem && this.inputStream.length > 1 && focusedItem.itemText.toLowerCase().startsWith(this.inputStream.toLowerCase())) {
            return;
        }
        this.activateItemByText(this.inputStream);
        console.log(this.inputStream);
        if (this.cancelSub$) {
            this.cancelSub$.unsubscribe();
        }
        this.cancelSub$ = timer(500).subscribe(() => {
            console.log('---');
            this.inputStream = '';
        });
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

        if (!this.target.collapsed) {
            this.target.navigateItem(items.indexOf(nextItem));
        } else {
            this.target.selectItem(nextItem);
            this.target.navigateItem(items.indexOf(nextItem));
        }
    }
}
