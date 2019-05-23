import {
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild
} from '@angular/core';

import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabItemBase, IgxTabsBase } from './tabs.common';

@Component({
    selector: 'igx-tab-item',
    templateUrl: 'tab-item.component.html'
})

export class IgxTabItemComponent implements IgxTabItemBase {

    /**
    * Gets the group associated with the tab.
    * ```html
    * const relatedGroup = this.tabbar.tabs.toArray()[1].relatedGroup;
    * ```
    */
    @Input()
    public relatedGroup: IgxTabsGroupComponent;

    /**
    * An @Input property that sets the value of the `icon`.
    * The value should be valid icon name from {@link https://material.io/tools/icons/?style=baseline}.
    *```html
    *<igx-tab-item label="Tab 1" icon="home">
    *```
    */
    @Input()
    public icon: string;

    /**
    * An @Input property that sets the value of the `label`.
    *```html
    *<igx-tabs-item label="Tab 1" icon="folder">
    *```
    */
    @Input()
    public label: string;

    /**@hidden*/
    @ViewChild('defaultTabTemplate', { read: TemplateRef })
    protected defaultTabTemplate: TemplateRef<any>;

    private _nativeTabItem: ElementRef;
    private _changesCount = 0; // changes and updates accordingly applied to the tab.
    private _isSelected = false;
    private _disabled = false;

    constructor(private _tabs: IgxTabsBase, private _element: ElementRef) {
        this._nativeTabItem = _element;
    }

    @HostBinding('class.igx-tabs__header-menu-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.isSelected;
    }

    @HostBinding('class.igx-tabs__header-menu-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.disabled;
    }

    @HostBinding('class.igx-tabs__header-menu-item')
    public get provideCssClass(): boolean {
        return (!this.disabled && !this.isSelected);
    }

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
        this.onKeyDown(false);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.arrowleft', ['$event'])
    public onKeydownArrowLeft(event: KeyboardEvent) {
        this.onKeyDown(true);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.home', ['$event'])
    public onKeydownHome(event: KeyboardEvent) {
        event.preventDefault();
        this.onKeyDown(false, 0);
    }

    /**
     * @hidden
     */
    @HostListener('keydown.end', ['$event'])
    public onKeydownEnd(event: KeyboardEvent) {
        event.preventDefault();
        this.onKeyDown(false, this._tabs.tabs.toArray().length - 1);
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
    get nativeTabItem(): ElementRef {
        return this._nativeTabItem;
    }

    /**
    * 	Gets whether the tab is disabled.
    * ```
    * const disabledItem = this.myTabComponent.tabs.first.disabled;
    * ```
    */
    @Input()
    get disabled(): boolean {
        if (this.relatedGroup) {
            return this.relatedGroup.disabled;
        }
        return this._disabled;
    }
    set disabled(newValue: boolean) {
        if (this.relatedGroup) {
            this.relatedGroup.disabled = newValue;
        } else {
            this._disabled = newValue;
        }
    }

    /**
     * Gets whether the tab is selected.
     * ```typescript
     * const selectedItem = this.myTabComponent.tabs.first.isSelected;
     * ```
     */
    @Input()
    get isSelected(): boolean {
        return this.relatedGroup ? this.relatedGroup.isSelected : this._isSelected;
    }
    set isSelected(newValue: boolean) {
        if (this.relatedGroup) {
            this.relatedGroup.isSelected = newValue;
        } else if (this._isSelected !== newValue) {
            this._isSelected = newValue;
            if (this._isSelected) {
                this._tabs.onTabItemSelected.emit({ tab: this, group: null });
            }
        }
    }

    /**
     * @hidden
     */
    get index(): number {
        return this._tabs.tabs.toArray().indexOf(this);
    }

    /**
     * @hidden
     */
    public select(focusDelay = 200): void {
        if (this.relatedGroup) {
            this.relatedGroup.select(focusDelay);
        } else {
            this._isSelected = true;
            this._tabs.onTabItemSelected.emit({ tab: this, group: null });
        }
    }

    private onKeyDown(isLeftArrow: boolean, index = null): void {
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
    public get template(): TemplateRef<any> {
        if (this.relatedGroup && this.relatedGroup.customTabTemplate) {
            return this.relatedGroup.customTabTemplate;
        }
        return this.defaultTabTemplate;
    }

    /**
     * @hidden
     */
    public get context(): any {
        if (this.relatedGroup) {
            return this.relatedGroup;
        }
        return this;
    }
}
