import {
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input
} from '@angular/core';

import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabItemBase, IgxTabsBase } from './tabs.common';

@Component({
    selector: 'igx-tab-item',
    templateUrl: 'tab-item.component.html'
})

export class IgxTabItemComponent implements IgxTabItemBase {
    private _nativeTabItem: ElementRef;
    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    /**
     * Gets the group associated with the tab.
     * ```html
     * const relatedGroup = this.tabbar.tabs.toArray()[1].relatedGroup;
     * ```
     */
    @Input()
    public relatedGroup: IgxTabsGroupComponent;

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'tab';

    /**
     * @hidden
     */
    @HostBinding('attr.tabindex')
    public tabindex;

    /**
     * @hidden
     */
    @HostListener('click', ['$event'])
    public onClick(event) {
        this.select();
    }

    /**
     * @hidden
     */
    @HostListener('window:resize', ['$event'])
    public onResize(event) {
        if (this.isSelected) {
            this._tabs.selectedIndicator.nativeElement.style.width = `${this.nativeTabItem.nativeElement.offsetWidth}px`;
            this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${this.nativeTabItem.nativeElement.offsetLeft}px)`;
        }
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowright', ['$event'])
    public onKeydownArrowRight(event: KeyboardEvent) {
        this._onKeyDown(false);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this._onKeyDown(true);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        this._onKeyDown(false, 0);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        this._onKeyDown(false, this._tabs.tabs.toArray().length - 1);
    }

    private _onKeyDown(isLeftArrow: boolean, index = null): void {
        const tabsArray = this._tabs.tabs.toArray();
        if (index === null) {
            index = (isLeftArrow)
                ? (this._tabs.selectedIndex === 0) ? tabsArray.length - 1 : this._tabs.selectedIndex - 1
                : (this._tabs.selectedIndex === tabsArray.length - 1) ? 0 : this._tabs.selectedIndex + 1;
        }
        const tab = tabsArray[index];
        tab.select(200);
    }

    /**
     * @hidden
     */
    get changesCount(): number {
        return this._changesCount;
    }

    /**
     * @hidden
     */
    get nativeTabItem() {
        return this._nativeTabItem;
    }

    /**
     * 	Gets whether the tab is disabled.
     * ```
     * const disabledItem = this.myTabComponent.tabs.first.disabled;
     * ```
     */
    get disabled(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.disabled;
        }
    }

    /**
     * Gets whether the tab is selected.
     * ```typescript
     * const selectedItem = this.myTabComponent.tabs.first.isSelected;
     * ```
     */
    get isSelected(): boolean {
        const group = this.relatedGroup;

        if (group) {
            return group.isSelected;
        }
    }

    /**
     * @hidden
     */
    get index(): number {
        return this._tabs.tabs.toArray().indexOf(this);
    }

    constructor(private _tabs: IgxTabsBase, private _element: ElementRef) {
        this._nativeTabItem = _element;
    }

    /**
     * @hidden
     */
    public select(focusDelay = 200) {
        this.relatedGroup.select(focusDelay);
    }
}
