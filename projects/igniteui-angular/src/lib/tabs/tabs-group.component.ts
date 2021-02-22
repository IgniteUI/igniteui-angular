import {
    AfterContentInit,
    Component,
    ContentChild,
    ElementRef,
    HostBinding,
    Input,
    TemplateRef,
} from '@angular/core';

import { IgxTabItemComponent } from './tab-item.component';
import { IgxTabItemTemplateDirective } from './tabs.directives';
import { IgxTabsBase, IgxTabsGroupBase } from './tabs.common';

@Component({
    selector: 'igx-tabs-group',
    templateUrl: 'tabs-group.component.html'
})

export class IgxTabsGroupComponent extends IgxTabsGroupBase implements AfterContentInit {
    /**
     * An @Input property that allows you to enable/disable the `IgxTabGroupComponent`.
     * ```html
     * <igx-tabs-group label="Tab 2  Lorem ipsum dolor sit" icon="home" [disabled]="true">
     * ```
     */
    @Input()
    public disabled = false;

    /**
     * An @Input property that sets the value of the `icon`.
     * The value should be valid icon name from {@link https://material.io/tools/icons/?style=baseline}.
     * ```html
     * <igx-tabs-group label="Tab 1" icon="home">
     * ```
     */
    @Input()
    public icon: string;

    /**
     * An @Input property that sets the value of the `label`.
     * ```html
     * <igx-tabs-group label="Tab 1" icon="folder">
     * ```
     */
    @Input()
    public label: string;

    /**
     * Sets/gets whether a tab group is selected.
     * ```typescript
     * this.tabGroup.isSelected = true;
     * ```
     * ```typescript
     * let isSelected = this.tabGroup.isSelected;
     * ```
     *
     * @memberof IgxTabsGroupComponent
     */
    public get isSelected(): boolean {
        return this._isSelected;
    }
    public set isSelected(newValue: boolean) {
        if (!this.disabled && this.isSelected !== newValue) {
            this._tabs.performSelectionChange(newValue ? this.relatedTab : null);
        }
    }

    /**
     * Returns the native element of the tabs-group component
     * ```typescript
     *  const mytabsGroupElement: HTMLElement = tabsGroup.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this._element.nativeElement;
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

    /**
     * @hidden
     */
    @ContentChild(IgxTabItemTemplateDirective, { read: IgxTabItemTemplateDirective })
    protected tabTemplate: IgxTabItemTemplateDirective;

    private _tabTemplate: TemplateRef<any>;
    private _isSelected = false;

    constructor(private _tabs: IgxTabsBase, private _element: ElementRef) {
        super();
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
    public get relatedTab(): IgxTabItemComponent {
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
    public get index(): number {
        if (this._tabs.groups) {
            return this._tabs.groups.toArray().indexOf(this);
        }
        return -1;
    }

    /**
     * @hidden
     */
    public get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    /**
     * @hidden
     */
    public set customTabTemplate(template: TemplateRef<any>) {
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
     * A method that sets the focus on a tab.
     *
     * @memberof {@link IgxTabsGroupComponent}
     * ```typescript
     *  @ViewChild("MyChild")
     * public tab : IgxTabsGroupComponent;
     * ngAfterViewInit(){
     *     this.tab.select();
     * }
     * ```
     */
    public select(): void {
        if (!this.disabled && !this.isSelected) {
            this._tabs.performSelectionChange(this.relatedTab);
        }
    }

    /**
     * @hidden
     */
    public setSelectedInternal(newValue: boolean) {
        this._isSelected = newValue;
    }
}
