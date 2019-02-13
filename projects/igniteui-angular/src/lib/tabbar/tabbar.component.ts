import { CommonModule } from '@angular/common';
import {
    AfterContentInit,
    AfterViewChecked,
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
    ViewChildren
} from '@angular/core';
import { IgxBadgeModule } from '../badge/badge.component';
import { IgxIconModule } from '../icon/index';

export interface ISelectTabEventArgs {
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
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/tabbar.html)
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
    templateUrl: 'tab-bar-content.component.html'
})
export class IgxBottomNavComponent implements AfterViewInit {
    /**
     * Gets the `IgxTabComponent` elements in the tab bar component.
     * ```typescript
     * let tabs: QueryList<IgxTabComponent> =  this.tabBar.tabs;
     * ```
     * @memberof IgxBottomNavComponent
     */
    @ViewChildren(forwardRef(() => IgxTabComponent)) public tabs: QueryList<IgxTabComponent>;
    /**
     * Gets the `IgxTabPanelComponent` elements in the tab bar component.
     * ```typescript
     * let tabPanels: QueryList<IgxTabPanelComponent> = this.tabBar.panels;
     * ```
     * @memberof IgxBottomNavComponent
     */
    @ContentChildren(forwardRef(() => IgxTabPanelComponent)) public panels: QueryList<IgxTabPanelComponent>;

    /**
     * Sets/gets the `id` of the tab bar.
     * If not set, the `id` of the first tab bar component will be `"igx-bottom-nav-0"`.
     * ```html
     * <igx-bottom-nav id = "my-first-tab-bar"></igx-bottom-nav>
     * ```
     * ```typescript
     * let tabBarId =  this.tabBar.id;
     * ```
     * @memberof IgxBottomNavComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-bottom-nav-${NEXT_ID++}`;
    /**
     * Emits an event when a new tab is selected.
     * Provides references to the `IgxTabComponent` and `IgxTabPanelComponent` as event arguments.
     * ```html
     * <igx-bottom-nav (onTableSelected) = "onTabSelected($event)"><igx-bottom-nav>
     * ```
     * @memberof IgxBottomNavComponent
     */
    @Output() public onTabSelected = new EventEmitter<ISelectTabEventArgs>();
    /**
     * Emits an event when a tab is deselected.
     * Provides references to the `IgxTabComponent` and `IgxTabPanelComponent` as event arguments.
     * ```html
     * <igx-bottom-nav (onTabDeselected) = "onTabDeselected($event)"><igx-bottom-nav>
     * ```
     * @memberof IgxBottomNavComponent
     */
    @Output() public onTabDeselected = new EventEmitter<ISelectTabEventArgs>();
    /**
     * Gets the `index` of selected tab/panel in the respective collection.
     * ```typescript
     * let index =  this.tabBar.selectedIndex;
     * ```
     * @memberof IgxBottomNavComponent
     */
    public selectedIndex = -1;
    /**
     * Gets the `itemStyle` of the tab bar.
     * ```typescript
     * let itemStyle =  this.tabBar.itemStyle;
     * ```
     * @memberof IgxBottomNavComponent
     */
    public get itemStyle(): string {
        return this._itemStyle;
    }
    /**
     *@hidden
     */
    private _itemStyle = 'igx-bottom-nav';
    /**
     * Gets the selected tab in the tab bar.
     * ```typescript
     * let tab =  this.tabBar.selectedTab;
     * ```
     * @memberof IgxBottomNavComponent
     */
    get selectedTab(): IgxTabComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }
    /**
     *@hidden
     */
    public ngAfterViewInit() {
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
     *@hidden
     */
    @HostListener('onTabSelected', ['$event'])
    public _selectedPanelHandler(args) {
        this.selectedIndex = args.panel.index;

        this.panels.forEach((p) => {
            if (p.index !== this.selectedIndex) {
                this._deselectPanel(p);
            }
        });
    }
    /**
     *@hidden
     */
    private _deselectPanel(panel: IgxTabPanelComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (panel.disabled || this.selectedTab.index === panel.index) {
            return;
        }

        panel.isSelected = false;
        this.onTabDeselected.emit({ tab: this.tabs[panel.index], panel });
    }
}

// ================================= IgxTabPanelComponent ======================================

@Component({
    selector: 'igx-tab-panel',
    templateUrl: 'tab-panel.component.html'
})

export class IgxTabPanelComponent implements AfterContentInit, AfterViewChecked {
    /**
     *@hidden
     */
    private _itemStyle = 'igx-tab-panel';
    /**
     * Sets/gets the `label` of the tab panel.
     * ```html
     * <igx-tab-panel [label] = "'Tab panel label'"><igx-tab-panel>
     * ```
     * ```typescript
     * let tabPanelLabel = this.tabPanel.label;
     * ```
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
     * @memberof IgxTabPanelComponent
     */
    @Input() public disabled: boolean;
    /**
     * Gets the role of the tab panel.
     * ```typescript
     * let tabPanelRole = this.tabPanel.role;
     * ```
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('attr.role') public role = 'tabpanel';
    /**
     * Gets whether a tab panel will have `igx-bottom-nav__panel` class.
     * ```typescript
     * let styleClass = this.tabPanel.styleClass;
     * ```
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('class.igx-bottom-nav__panel')
    get styleClass(): boolean {
        return (!this.isSelected);
    }
    /**
     * Sets/gets whether a tab panel is selected.
     * ```typescript
     * this.tabPanel.isSelected = true;
     * ```
     * ```typescript
     * let isSelected =  this.tabPanelIsSelected;
     * ```
     * @memberof IgxTabPanelComponent
     */
    @HostBinding('class.igx-bottom-nav__panel--selected')
    public isSelected = false;
    /**
     * Gets the `itemStyle` of the tab panel.
     * ```typescript
     * let itemStyle = this.tabPanel.itemStyle;
     * ```
     * @memberof IgxTabPanelComponent
     */
    public get itemStyle(): string {
        return this._itemStyle;
    }
    /**
     * Gets the tab associated with the panel.
     * ```typescript
     * let tab = this.tabPanel.relatedTab;
     * ```
     * @memberof IgxTabPanelComponent
     */
    get relatedTab(): IgxTabComponent {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }
    }
    /**
     * Gets the index of a panel in the panels collection.
     * ```typescript
     * let panelIndex =  this.tabPanel.index
     * ```
     * @memberof IgxTabPanelComponent
     */
    get index() {
        if (this._tabBar.panels) {
            return this._tabBar.panels.toArray().indexOf(this);
        }
    }
    /**
     * Gets the tab template.
     * ```typescript
     * let tabTemplate = this.tabPanel.customTabTemplate
     * ```
     * @memberof IgxTabPanelComponent
     */
    get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }
    /**
     * Sets the tab template.
     * ```typescript
     * this.tabPanel.customTabTemplate(tabTemplate);
     * ```
     * @memberof IgxTabPanelComponent
     */
    set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }
    /**
     *@hidden
     */
    private _tabTemplate: TemplateRef<any>;
    /**
     *@hidden
     */
    @ContentChild(IgxTabTemplateDirective, { read: IgxTabTemplateDirective })
    protected tabTemplate: IgxTabTemplateDirective;

    constructor(private _tabBar: IgxBottomNavComponent, private _element: ElementRef) {
    }
    /**
     *@hidden
     */
    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }
    /**
     *@hidden
     */
    public ngAfterViewChecked() {
        this._element.nativeElement.setAttribute('aria-labelledby', `igx-tab-${this.index}`);
        this._element.nativeElement.setAttribute('id', `igx-bottom-nav__panel-${this.index}`);
    }
    /**
     * Selects the current tab and the tab panel.
     * ```typescript
     * this.tabPanel.select();
     * ```
     * @memberof IgxTabPanelComponent
     */
    public select() {
        if (this.disabled || this._tabBar.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
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
     * @memberof IgxTabComponent
     */
    @HostBinding('attr.role') public role = 'tab';
    /**
     * Gets the panel associated with the tab.
     * ```typescript
     * let tabPanel =  this.tab.relatedPanel;
     * ```
     * @memberof IgxTabComponent
     */
    @Input() public relatedPanel: IgxTabPanelComponent;
    /**
     *@hidden
     */
    private _changesCount = 0; // changes and updates accordingly applied to the tab.
    /**
     * Gets the changes and updates accordingly applied to the tab.
     *
     * @memberof IgxTabComponent
     */
    get changesCount(): number {
        return this._changesCount;
    }
    /**
     * Gets whether the tab is disabled.
     * ```typescript
     * let isDisabled = this.tab.disabled;
     * ```
     * @memberof IgxTabComponent
     */
    get disabled(): boolean {
        const panel = this.relatedPanel;

        if (panel) {
            return panel.disabled;
        }
    }
    /**
     * Gets whether the tab is selected.
     * ```typescript
     * let isSelected  = this.tab.isSelected;
     * ```
     * @memberof IgxTabComponent
     */
    get isSelected(): boolean {
        const panel = this.relatedPanel;

        if (panel) {
            return panel.isSelected;
        }
    }
    /**
     * Gets the `index` of the tab.
     * ```typescript
     * let tabIndex = this.tab.index;
     * ```
     * @memberof IgxTabComponent
     */
    get index(): number {
        return this._tabBar.tabs.toArray().indexOf(this);
    }

    constructor(private _tabBar: IgxBottomNavComponent, private _element: ElementRef) {
    }
    /**
     * Selects the current tab and the associated panel.
     * ```typescript
     * this.tab.select();
     * ```
     * @memberof IgxTabComponent
     */
    public select() {
        this.relatedPanel.select();
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
