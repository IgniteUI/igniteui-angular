import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    OnDestroy
} from '@angular/core';
import { IgxBadgeModule } from '../badge/badge.component';
import { IgxIconModule } from '../icon/public_api';
import { IBaseEventArgs } from '../core/utils';
import { Subscription } from 'rxjs';

export interface ISelectTabEventArgs extends IBaseEventArgs {
    tab: IgxTabComponent;
    panel: IgxTabPanelComponent;
}

let NEXT_ID = 0;

@Directive({
    selector: '[igxTab]'
})
export class IgxTabTemplateDirective {

    constructor(public template: TemplateRef<any>) {
    }
}
/**
 * **Ignite UI for Angular Tab Bar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar)
 *
 * The Ignite UI Tab Bar enables the user to navigate among a number of content panels displayed in a single view.
 *
 * Example:
 * ```html
 * <igx-bottom-nav>
 *   <igx-tab-panel label="Tab 1">Tab 1 Content</igx-tab-panel>
 *   <igx-tab-panel label="Tab 2">Tab 2 Content</igx-tab-panel>
 *   <igx-tab-panel label="Tab 3">Tab 3 Content</igx-tab-panel>
 * </igx-bottom-nav>
 * ```
 */
@Component({
    selector: 'igx-bottom-nav',
    templateUrl: 'tab-bar-content.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxBottomNavComponent implements AfterViewInit, OnDestroy {
    /**
     * Gets the `IgxTabComponent` elements in the tab bar component created based on the provided panels.
     * ```typescript
     * let tabs: QueryList<IgxTabComponent> =  this.tabBar.viewTabs;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    @ViewChildren(forwardRef(() => IgxTabComponent))
    public viewTabs: QueryList<IgxTabComponent>;

    /**
     * Gets the `IgxTabComponent` elements in the tab bar component defined as content child.
     * ```typescript
     * let tabs: QueryList<IgxTabComponent> =  this.tabBar.contentTabs;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    @ContentChildren(forwardRef(() => IgxTabComponent))
    public contentTabs: QueryList<IgxTabComponent>;

    /**
     * Gets the `IgxTabComponent` elements for this bottom navigation component.
     * First try to get them as content children if not available get them as view children.
     * ```typescript
     * let tabs: QueryList<IgxTabComponent> =  this.tabBar.tabs;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    public get tabs(): QueryList<IgxTabComponent> {
        return this.hasContentTabs ? this.contentTabs : this.viewTabs;
    }

    /**
     * Gets the `IgxTabPanelComponent` elements in the tab bar component.
     * ```typescript
     * let tabPanels: QueryList<IgxTabPanelComponent> = this.tabBar.panels;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    @ContentChildren(forwardRef(() => IgxTabPanelComponent))
    public panels: QueryList<IgxTabPanelComponent>;

    /**
     * Emits an event when a new tab is selected.
     * Provides references to the `IgxTabComponent` and `IgxTabPanelComponent` as event arguments.
     * ```html
     * <igx-bottom-nav (onTableSelected) = "onTabSelected($event)"><igx-bottom-nav>
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    @Output() public onTabSelected = new EventEmitter<ISelectTabEventArgs>();

    /**
     * Emits an event when a tab is deselected.
     * Provides references to the `IgxTabComponent` and `IgxTabPanelComponent` as event arguments.
     * ```html
     * <igx-bottom-nav (onTabDeselected) = "onTabDeselected($event)"><igx-bottom-nav>
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    @Output() public onTabDeselected = new EventEmitter<ISelectTabEventArgs>();

    private readonly _currentBottomNavId = NEXT_ID++;
    /**
     * Sets/gets the `id` of the tab bar.
     * If not set, the `id` of the first tab bar component will be `"igx-bottom-nav-0"`.
     * ```html
     * <igx-bottom-nav id = "my-first-tab-bar"></igx-bottom-nav>
     * ```
     * ```typescript
     * let tabBarId =  this.tabBar.id;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @HostBinding('attr.id')
    @Input()
    public id = `igx-bottom-nav-${this._currentBottomNavId}`;

    /**
     * Gets the `index` of selected tab/panel in the respective collection.
     * ```typescript
     * let index =  this.tabBar.selectedIndex;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public selectedIndex = -1;

    /**
     * Gets the `itemStyle` of the tab bar.
     * ```typescript
     * let itemStyle =  this.tabBar.itemStyle;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    public get itemStyle(): string {
        return this._itemStyle;
    }

    /**
     * @hidden
     */
    public get hasContentTabs(): boolean {
        return (this.contentTabs && this.contentTabs.length > 0);
    }

    /**
     * @hidden
     */
    private readonly _itemStyle = 'igx-bottom-nav';
    private _panelsChanges$: Subscription;

    /**
     * Gets the selected tab in the tab bar.
     * ```typescript
     * let tab =  this.tabBar.selectedTab;
     * ```
     *
     * @memberof IgxBottomNavComponent
     */
    public get selectedTab(): IgxTabComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    /**
     * @hidden
     */
    @HostListener('onTabSelected', ['$event'])
    public selectedPanelHandler(args) {
        if (this.hasContentTabs) {
            this.selectedIndex = args.tab.index;
            this.contentTabs.forEach((t) => {
                if (t !== args.tab) {
                    this._deselectTab(t);
                }
            });
        } else {
            if (args.panel) {
                this.selectedIndex = args.panel.index;
                this.panels.forEach((p) => {
                    if (p.index !== this.selectedIndex) {
                        this._deselectPanel(p);
                    }
                });
            }
        }
    }

    /**
     * @hidden
     */
    public ngAfterViewInit() {
        this.setPanelsAttributes();
        this._panelsChanges$ = this.panels.changes.subscribe(() => {
            this.setPanelsAttributes();
        });

        // initial selection
        setTimeout(() => {
            if (this.selectedIndex === -1) {
                const selectablePanels = this.panels.filter((p) => !p.disabled);
                const panel = selectablePanels[0];
                if (panel) {
                    panel.select();
                }
            }
        }, 0);
    }

    /**
     * @hidden
     */
    public ngOnDestroy(): void {
        if (this._panelsChanges$) {
            this._panelsChanges$.unsubscribe();
        }
    }

    /**
     * @hidden
     */
    public getTabId(index: number): string {
        return `igx-tab-${this._currentBottomNavId}-${index}`;
    }

    /**
     * @hidden
     */
    public getTabPanelId(index: number): string {
        return `igx-tab-panel-${this._currentBottomNavId}-${index}`;
    }

    private setPanelsAttributes() {
        const panelsArray = Array.from(this.panels);
        for (let index = 0; index < this.panels.length; index++) {
            const tabPanels = panelsArray[index] as IgxTabPanelComponent;
            tabPanels.nativeElement.setAttribute('id', this.getTabPanelId(index));
            tabPanels.nativeElement.setAttribute('aria-labelledby', this.getTabId(index));
        }
    }

    /**
     * @hidden
     */
    private _deselectPanel(panel: IgxTabPanelComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (panel.disabled || this.selectedTab.index === panel.index) {
            return;
        }

        panel.isSelected = false;
        this.onTabDeselected.emit({ tab: this.tabs[panel.index], panel });
    }

    private _deselectTab(aTab: IgxTabComponent) {
        aTab.isSelected = false;
        this.onTabDeselected.emit({ tab: aTab, panel: null });
    }
}

// ================================= IgxTabPanelComponent ======================================

@Component({
    selector: 'igx-tab-panel',
    templateUrl: 'tab-panel.component.html'
})
export class IgxTabPanelComponent implements AfterContentInit {
    /**
     * Sets/gets the `label` of the tab panel.
     * ```html
     * <igx-tab-panel [label] = "'Tab panel label'"><igx-tab-panel>
     * ```
     * ```typescript
     * let tabPanelLabel = this.tabPanel.label;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @Input() public label: string;

    /**
     * Sets/gets  the `icon` of the tab panel.
     * ```html
     * <igx-tab-panel [icon] = "panel_icon"><igx-tab-panel>
     * ```
     * ```typescript
     * let tabPanelIcon =  this.tabPanel.icon;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @Input() public icon: string;

    /**
     * Sets/gets whether the tab panel is disabled.
     * ```html
     * <igx-tab-panel [disabled] = "true"><igx-tab-panel>
     * ```
     * ```typescript
     * let isDisabled = this.tabPanel.disabled;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @Input() public disabled: boolean;

    /**
     * Gets the role of the tab panel.
     * ```typescript
     * let tabPanelRole = this.tabPanel.role;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('attr.role') public role = 'tabpanel';

    /**
     * Gets whether a tab panel will have `igx-bottom-nav__panel` class.
     * ```typescript
     * let styleClass = this.tabPanel.styleClass;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('class.igx-bottom-nav__panel')
    public get styleClass(): boolean {
        return (!this.isSelected);
    }

    /**
     * Sets/gets whether a tab panel is selected.
     * ```typescript
     * this.tabPanel.isSelected = true;
     * ```
     * ```typescript
     * let isSelected =  this.tabPanel.isSelected;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('class.igx-bottom-nav__panel--selected')
    public get isSelected(): boolean {
        return this._isSelected;
    }
    public set isSelected(newValue: boolean) {
        if (this._isSelected !== newValue) {
            if (newValue) {
                this.select();
            } else {
                this._isSelected = newValue;
            }
        }
    }

    /**
     * Gets the `itemStyle` of the tab panel.
     * ```typescript
     * let itemStyle = this.tabPanel.itemStyle;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public get itemStyle(): string {
        return this._itemStyle;
    }

    /**
     * Returns the native element of the tab-panel component
     * ```typescript
     *  const mytabPanelElement: HTMLElement = tabPanel.nativeElement;
     * ```
     */
    public get nativeElement() {
        return this._element.nativeElement;
    }

    /**
     * Gets the tab associated with the panel.
     * ```typescript
     * let tab = this.tabPanel.relatedTab;
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public get relatedTab(): IgxTabComponent {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }
    }

    /**
     * Gets the changes and updates accordingly applied to the tab/panel.
     *
     * @memberof IgxTabComponent
     */
    public get changesCount(): number {
        return this.relatedTab ? this.relatedTab.changesCount : 0;
    }

    /**
     * Gets the index of a panel in the panels collection.
     * ```typescript
     * let panelIndex =  this.tabPanel.index
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public get index() {
        if (this._tabBar.panels) {
            return this._tabBar.panels.toArray().indexOf(this);
        }
    }

    /**
     * Gets the tab template.
     * ```typescript
     * let tabTemplate = this.tabPanel.customTabTemplate
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    /**
     * Sets the tab template.
     * ```typescript
     * this.tabPanel.customTabTemplate(tabTemplate);
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }

    /**
     * @hidden
     */
    @ContentChild(IgxTabTemplateDirective, { read: IgxTabTemplateDirective })
    protected tabTemplate: IgxTabTemplateDirective;

    /**
     * @hidden
     */
    private _tabTemplate: TemplateRef<any>;

    /**
     * @hidden
     */
    private readonly _itemStyle = 'igx-tab-panel';

    /**
     * @hidden
     */
    private _isSelected = false;

    constructor(private _tabBar: IgxBottomNavComponent, private _element: ElementRef) {
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
     * Selects the current tab and the tab panel.
     * ```typescript
     * this.tabPanel.select();
     * ```
     *
     * @memberof IgxTabPanelComponent
     */
    public select() {
        if (this.disabled || this._tabBar.selectedIndex === this.index) {
            return;
        }

        this._isSelected = true;
        this._tabBar.onTabSelected.emit({ tab: this._tabBar.tabs.toArray()[this.index], panel: this });
    }
}

// ======================================= IgxTabComponent ==========================================

@Component({
    selector: 'igx-tab',
    templateUrl: 'tab.component.html'
})
export class IgxTabComponent {
    /**
     * Gets the `role` attribute.
     * ```typescript
     * let tabRole = this.tab.role;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @HostBinding('attr.role')
    public role = 'tab';

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
     * Gets the panel associated with the tab.
     * ```typescript
     * let tabPanel =  this.tab.relatedPanel;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @Input()
    public relatedPanel: IgxTabPanelComponent;

    /**
     * @hidden @internal
     * Set to true when the tab is automatically generated from the IgxBottomNavComponent when tab panels are defined.
     */
    @Input()
    public autoGenerated: boolean;

    /** @hidden */
    @ViewChild('defaultTabTemplate', { read: TemplateRef, static: true })
    protected defaultTabTemplate: TemplateRef<any>;

    /** @hidden */
    @ContentChild(IgxTabTemplateDirective, { read: IgxTabTemplateDirective })
    protected customTabTemplateDir: IgxTabTemplateDirective;

    /**
     * @hidden
     */
    private _label: string;

    /**
     * Sets/gets the `label` of the tab panel.
     * ```html
     * <igx-tab [label] = "'Tab label'"><igx-tab>
     * ```
     * ```typescript
     * let tabLabel = this.tab.label;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @Input()
    public get label(): string {
        return this.relatedPanel ? this.relatedPanel.label : this._label;
    }
    public set label(newValue: string) {
        if (this.relatedPanel) {
            this.relatedPanel.label = newValue;
        }
        this._label = newValue;
    }

    /**
     * @hidden
     */
    private _icon: string;

    /**
     * Sets/gets  the `icon` of the tab panel.
     * ```html
     * <igx-tab [icon] = "tab_icon"><igx-tab>
     * ```
     * ```typescript
     * let tabIcon =  this.tab.icon;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @Input()
    public get icon(): string {
        return this.relatedPanel ? this.relatedPanel.icon : this._icon;
    }
    public set icon(newValue: string) {
        if (this.relatedPanel) {
            this.relatedPanel.icon = newValue;
        }
        this._icon = newValue;
    }

    /**
     * @hidden
     */
    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    /**
     * Gets the changes and updates accordingly applied to the tab.
     *
     * @memberof IgxTabComponent
     */
    public get changesCount(): number {
        return this._changesCount;
    }

    private _disabled = false;

    /**
     * Gets whether the tab is disabled.
     * ```typescript
     * let isDisabled = this.tab.disabled;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @Input()
    public get disabled(): boolean {
        return this.relatedPanel ? this.relatedPanel.disabled : this._disabled;
    }
    public set disabled(newValue: boolean) {
        if (this.relatedPanel) {
            this.relatedPanel.disabled = newValue;
        } else {
            this._disabled = newValue;
        }
    }

    private _selected = false;

    /**
     * Gets whether the tab is selected.
     * ```typescript
     * let isSelected  = this.tab.isSelected;
     * ```
     *
     * @memberof IgxTabComponent
     */
    @Input()
    public set isSelected(newValue: boolean) {
        if (this.relatedPanel) {
            this.relatedPanel.isSelected = newValue;
        } else if (this._selected !== newValue) {
            this._selected = newValue;
            if (this._selected) {
                this._tabBar.onTabSelected.emit({ tab: this, panel: null });
            }
        }
    }
    public get isSelected(): boolean {
        return this.relatedPanel ? this.relatedPanel.isSelected : this._selected;
    }

    @HostBinding('class.igx-bottom-nav__menu-item--selected')
    public get cssClassSelected(): boolean {
        return this.isSelected;
    }

    @HostBinding('class.igx-bottom-nav__menu-item--disabled')
    public get cssClassDisabled(): boolean {
        return this.disabled;
    }

    @HostBinding('class.igx-bottom-nav__menu-item')
    public get cssClass(): boolean {
        return (!this.disabled && !this.isSelected);
    }

    /**
     * Gets the `index` of the tab.
     * ```typescript
     * let tabIndex = this.tab.index;
     * ```
     *
     * @memberof IgxTabComponent
     */
    public get index(): number {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray().indexOf(this);
        }
    }

    /**
     * Returns the `template` for this IgxTabComponent.
     * ```typescript
     * let tabItemTemplate = this.tabItem.template;
     * ```
     *
     * @memberof IgxTabComponent
     */
    public get template(): TemplateRef<any> {
        if (this.relatedPanel && this.relatedPanel.customTabTemplate) {
            return this.relatedPanel.customTabTemplate;
        }
        if (this.customTabTemplateDir) {
            return this.customTabTemplateDir.template;
        }
        return this.defaultTabTemplate;
    }

    /**
     * Returns the `context` object for the template of this `IgxTabComponent`.
     * ```typescript
     * let tabItemContext = this.tabItem.context;
     * ```
     */
    public get context(): any {
        return this.relatedPanel ? this.relatedPanel : this;
    }

    constructor(private _tabBar: IgxBottomNavComponent, private _element: ElementRef) {
    }

    /**
     * @hidden
     */
    @HostListener('click')
    public onClick() {
        if (this.autoGenerated) {
            this.select();
        }
    }

    /**
     * Selects the current tab and the associated panel.
     * ```typescript
     * this.tab.select();
     * ```
     *
     * @memberof IgxTabComponent
     */
    public select() {
        if (this.relatedPanel) {
            this.relatedPanel.select();
        } else {
            this._selected = true;
            this._tabBar.onTabSelected.emit({ tab: this, panel: null });
        }
    }

    public elementRef(): ElementRef {
        return this._element;
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxBottomNavComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
    exports: [IgxBottomNavComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule]
})
export class IgxBottomNavModule {
}
