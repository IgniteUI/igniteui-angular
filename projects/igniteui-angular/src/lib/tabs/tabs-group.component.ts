import {
    AfterContentInit,
    AfterViewChecked,
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    TemplateRef,
    HostListener
} from '@angular/core';

import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabItemTemplateDirective } from './tabs.directives';
import { IgxTabsBase, IgxTabsGroupBase } from './tabs.common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'igx-tabs-group',
    templateUrl: 'tabs-group.component.html'
})

export class IgxTabsGroupComponent implements IgxTabsGroupBase, AfterContentInit, AfterViewChecked {

    /**
    * An @Input property that allows you to enable/disable the `IgxTabGroupComponent`.
    *```html
    *<igx-tabs-group label="Tab 2  Lorem ipsum dolor sit" icon="home" [disabled]="true">
    *```
    */
    @Input()
    public disabled = false;

    /**
    * An @Input property that sets the value of the `icon`.
    * The value should be valid icon name from {@link https://material.io/tools/icons/?style=baseline}.
    *```html
    *<igx-tabs-group label="Tab 1" icon="home">
    *```
    */
    @Input()
    public icon: string;

    /**
    * An @Input property that sets the value of the `label`.
    *```html
    *<igx-tabs-group label="Tab 1" icon="folder">
    *```
    */
    @Input()
    public label: string;

    public isSelected = false;

    /**
     * @hidden
     */
    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
    protected tabTemplate: IgxTabItemTemplateDirective;

    private _tabTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    @ContentChild(RouterLink)
    public routerLinkDirective: RouterLink;

    constructor(private _tabs: IgxTabsBase, private _element: ElementRef) {
    }

    /**
     * @hidden
     */
    @HostBinding('attr.role')
    public role = 'tabpanel';

    /**
     * @hidden
     */
    @HostBinding('class.igx-tabs__group')
    public styleClass = true;

    @HostListener('window:resize', ['$event'])
    public onResize(event) {
        if (this.isSelected) {
            this.transformContentAnimation(0);
        }
    }

    /**
     * An accessor that returns the `IgxTabItemComponent` component.
     * ```typescript
     * @ViewChild("MyTabsGroup")
     * public tab: IgxTabsGroupComponent;
     * ngAfterViewInIt(){
     *    let tabComponent = this.tab.relatedTab;
     * }
     * ```
     */
    get relatedTab(): IgxTabItemComponent {
        if (this._tabs.tabs) {
            return this._tabs.tabs.toArray()[this.index] as IgxTabItemComponent;
        }
    }

    /**
     * An accessor that returns the value of the index of the `IgxTabsGroupComponent`.
     * ```typescript
     * @ViewChild("MyTabsGroup")
     * public tab: IgxTabsGroupComponent;
     * ngAfterViewInIt(){
     *    let tabIndex = this.tab.index;
     * }
     * ```
     */
    get index(): number {
        if (this._tabs.groups) {
            return this._tabs.groups.toArray().indexOf(this);
        }
    }

    /**
     * @hidden
     */
    get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    /**
     *@hidden
     */
    set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }

    /**
     * @hidden
     */
    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }

    /**
     * @hidden
     */
    public ngAfterViewChecked() {
        this._element.nativeElement.setAttribute('aria-labelledby', `igx-tab-item-${this.index}`);
        this._element.nativeElement.setAttribute('id', `igx-tabs__group-${this.index}`);

        if (this.isSelected) {
            this.transformContentAnimation(0);
        }
    }

    /**
     * A method that sets the focus on a tab.
     * @memberof {@link IgxTabsGroupComponent}
     *```typescript
     *@ViewChild("MyChild")
     *public tab : IgxTabsGroupComponent;
     *ngAfterViewInit(){
     *    this.tab.select();
     *}
     *```
     * @param focusDelay A number representing the expected delay.
     */
    public select(focusDelay = 200, updateRoute: boolean = true): void {
        if (this.disabled || this.isSelected) {
            return;
        }

        this.isSelected = true;
        this.relatedTab.tabindex = 0;

        if (focusDelay !== 0) {
            setTimeout(() => {
                this.relatedTab.nativeTabItem.nativeElement.focus();
            }, focusDelay);
        }
        this.handleSelection();
        if (updateRoute && this.routerLinkDirective) {
            console.log('@@ tabs-group: navigating to ' + this.routerLinkDirective.urlTree.toString());
            this.routerLinkDirective.onClick();
        }
        this._tabs.onTabItemSelected.emit({ tab: this._tabs.tabs.toArray()[this.index], group: this });
    }

    private handleSelection(): void {
        const tabElement = this.relatedTab.nativeTabItem.nativeElement;

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

        this.transformContentAnimation(0.2);

        this._tabs.selectedIndicator.nativeElement.style.width = `${tabElement.offsetWidth}px`;
        this._tabs.selectedIndicator.nativeElement.style.transform = `translate(${tabElement.offsetLeft}px)`;
    }

    private transformContentAnimation(duration: number): void {
        const contentOffset = this._tabs.tabsContainer.nativeElement.offsetWidth * this.index;
        this._tabs.contentsContainer.nativeElement.style.transitionDuration = `${duration}s`;
        this._tabs.contentsContainer.nativeElement.style.transform = `translate(${-contentOffset}px)`;
    }
}
