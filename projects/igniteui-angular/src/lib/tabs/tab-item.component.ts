import {
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    TemplateRef,
    ViewChild
} from '@angular/core';

import { IgxTabsGroupComponent } from './tabs-group.component';
import { IgxTabItemBase, IgxTabsBase } from './tabs.common';
import { IgxTabItemTemplateDirective } from './tabs.directives';

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

    /**@hidden*/
    private _icon: string;

    /**
    * An @Input property that sets the value of the `icon`.
    * The value should be valid icon name from {@link https://material.io/tools/icons/?style=baseline}.
    *```html
    *<igx-tab-item label="Tab 1" icon="home">
    *```
    */
    @Input()
    public get icon(): string {
        return this.relatedGroup ? this.relatedGroup.icon : this._icon;
    }
    public set icon(newValue: string) {
        if (this.relatedGroup) {
            this.relatedGroup.icon = newValue;
        }
        this._icon = newValue;
    }

    /**@hidden*/
    private _label: string;

    /**
    * An @Input property that sets the value of the `label`.
    *```html
    *<igx-tabs-item label="Tab 2" icon="folder">
    *```
    */
    @Input()
    public get label(): string {
        return this.relatedGroup ? this.relatedGroup.label : this._label;
    }
    public set label(newValue: string) {
        if (this.relatedGroup) {
            this.relatedGroup.label = newValue;
        }
        this._label = newValue;
    }

    /**@hidden*/
    @ViewChild('defaultTabTemplate', { read: TemplateRef, static: true })
    protected defaultTabTemplate: TemplateRef<any>;

    /**@hidden*/
    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective, static: true })
    protected customTabTemplateDir: IgxTabItemTemplateDirective;

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
     * @hidden @internal
     */
    @HostBinding('attr.role')
    public role = 'tab';

    /**
     * @hidden @internal
     */
    @HostBinding('attr.tabindex')
    public tabindex;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.id')
    public id = 'igx-tab-item-' + this.index;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-label')
    public ariaLabel = this.label;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-disabled')
    public ariaDisabled = this.disabled;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-selected')
    public ariaSelected = this.isSelected;

    /**
     * @hidden @internal
     */
    @HostBinding('attr.aria-controls')
    public ariaControls = 'igx-tab-item-group-' + this.index;

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
            this._tabs.selectedIndicator.nativeElement.style.visibility = 'visible';
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
        return this.relatedGroup ? this.relatedGroup.disabled : this._disabled;
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
                this.select();
            }
        }
    }

    /**
     * @hidden
     */
    get index(): number {
        if (this._tabs.tabs) {
            return this._tabs.tabs.toArray().indexOf(this);
        }
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
            this.handleTabSelectionAnimation();
        }
    }

    private handleTabSelectionAnimation(): void {
        const tabElement = this.nativeTabItem.nativeElement;

        // Scroll to the left
        if (tabElement.offsetLeft < this._tabs.offset) {
            this._tabs.scrollElement(tabElement, false);
        }

        // Scroll to the right
        const viewPortOffsetWidth = this._tabs.viewPort.nativeElement.offsetWidth;
        const delta = (tabElement.offsetLeft + tabElement.offsetWidth) - (viewPortOffsetWidth + this._tabs.offset);
        // Fix for IE 11, a difference is accumulated from the widths calculations
        if (delta > 1) {
            this._tabs.scrollElement(tabElement, true);
        }

        this.transformIndicatorAnimation(tabElement);
    }

    private transformIndicatorAnimation(element: HTMLElement): void {
        if (this._tabs && this._tabs.selectedIndicator) {
            this._tabs.selectedIndicator.nativeElement.style.visibility = `visible`;
            this._tabs.selectedIndicator.nativeElement.style.width = `${element.offsetWidth}px`;
            this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${element.offsetLeft}px)`;
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
        if (this.customTabTemplateDir) {
            return this.customTabTemplateDir.template;
        }
        return this.defaultTabTemplate;
    }

    /**
     * @hidden
     */
    public get context(): any {
        return this.relatedGroup ? this.relatedGroup : this;
    }
}
