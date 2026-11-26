import { Directive, Input } from '@angular/core';
import { IgxSelectItemComponent } from './select-item.component';
import { IgxSelectBase } from './select.common';
import { IgxDropDownItemNavigationDirective } from 'igniteui-angular/drop-down';
import { IgxTypeAhead, findTypeAheadMatch } from 'igniteui-angular/core';

const label = (item: IgxSelectItemComponent) => item.itemText;
const skip = (item: IgxSelectItemComponent) => item.disabled;

/** @hidden @internal */
@Directive({
    selector: '[igxSelectItemNavigation]',
    standalone: true
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective {
    protected override _target: IgxSelectBase = null!;

    @Input('igxSelectItemNavigation')
    public override get target(): IgxSelectBase {
        return this._target;
    }
    public override set target(target: IgxSelectBase) {
        this._target = target ? target : this.dropdown as IgxSelectBase;
    }

    /** Captures keydown events and calls the appropriate handlers on the target component */
    public override handleKeyDown(event: KeyboardEvent) {
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
                    this.target.selectItem(this.target.focusedItem!);
                    event.preventDefault();
                    return;
                case 'arrowup':
                case 'up':
                    this.target.navigatePrev();
                    this.target.selectItem(this.target.focusedItem!);
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

    private readonly _typeAhead = new IgxTypeAhead({ label, skip });

    public captureKey(event: KeyboardEvent) {
        // relying only on key, available on all major browsers:
        // https://caniuse.com/#feat=keyboardevent-key (IE/Edge quirk doesn't affect letter typing)
        if (!event || !event.key || event.key.length > 1 || event.key === ' ' || event.key === 'spacebar') {
            // ignore longer keys ('Alt', 'ArrowDown', etc) AND spacebar (used of open/close)
            return;
        }

        const focusedItem = this.target.focusedItem as IgxSelectItemComponent;
        const nextItem = this._typeAhead.search(event.key, this.target.items as IgxSelectItemComponent[], focusedItem);

        if (nextItem && nextItem !== focusedItem) {
            this.activateItem(nextItem);
        }
    }

    public activateItemByText(text: string) {
        const items = this.target.items as IgxSelectItemComponent[];
        const current = this.target.focusedItem as IgxSelectItemComponent;
        const nextItem = findTypeAheadMatch(items, text, { label, skip, current });

        // If there is no other item to be found, do not change the active item.
        if (nextItem) {
            this.activateItem(nextItem);
        }
    }

    private activateItem(item: IgxSelectItemComponent) {
        // ^ this is focused OR selected if the dd is closed
        if (this.target.collapsed) {
            this.target.selectItem(item);
        }
        this.target.navigateItem(this.target.items.indexOf(item));
    }
}
