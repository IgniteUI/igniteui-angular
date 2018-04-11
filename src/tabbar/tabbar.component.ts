import { CommonModule } from "@angular/common";
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
    ViewChildren
} from "@angular/core";
import { IgxBadgeModule } from "../badge/badge.component";
import { IgxIconModule } from "../icon";

export interface ISelectTabEventArgs {
    tab: IgxTabComponent;
    panel: IgxTabPanelComponent;
}

@Directive({
    selector: "[igxTab]"
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
 * <igx-tab-bar>
 *   <igx-tab-panel label="Tab 1">Tab 1 Content</igx-tab-panel>
 *   <igx-tab-panel label="Tab 2">Tab 2 Content</igx-tab-panel>
 *   <igx-tab-panel label="Tab 3">Tab 3 Content</igx-tab-panel>
 * </igx-tab-bar>
 * ```
 */
let NEXT_ID = 0;
@Component({
    selector: "igx-tab-bar",
    templateUrl: "tab-bar-content.component.html"
})

export class IgxTabBarComponent implements AfterViewInit {
    @ViewChildren(forwardRef(() => IgxTabComponent)) public tabs: QueryList<IgxTabComponent>;
    @ContentChildren(forwardRef(() => IgxTabPanelComponent)) public panels: QueryList<IgxTabPanelComponent>;

    @Input()
    public id = `igx-tab-bar-${NEXT_ID++}`;
    @Output() public onTabSelected = new EventEmitter<ISelectTabEventArgs>();
    @Output() public onTabDeselected = new EventEmitter<ISelectTabEventArgs>();

    public selectedIndex = -1;

    public get itemStyle(): string {
        return this._itemStyle;
    }

    private _itemStyle = "igx-tab-bar";

    get selectedTab(): IgxTabComponent {
        if (this.tabs && this.selectedIndex !== undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }

    public ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            if (this.selectedIndex === -1) {
                const selectablePanels = this.panels.filter((p) => !p.isDisabled);
                const panel = selectablePanels[0];

                if (panel) {
                    panel.select();
                }
            }
        }, 0);
    }

    @HostListener("onTabSelected", ["$event"])
    public _selectedPanelHandler(args) {
        this.selectedIndex = args.panel.index;

        this.panels.forEach((p) => {
            if (p.index !== this.selectedIndex) {
                this._deselectPanel(p);
            }
        });
    }

    private _deselectPanel(panel: IgxTabPanelComponent) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (panel.isDisabled || this.selectedTab.index === panel.index) {
            return;
        }

        panel.isSelected = false;
        this.onTabDeselected.emit({ tab: this.tabs[panel.index], panel });
    }
}

// ================================= IgxTabPanelComponent ======================================

@Component({
    selector: "igx-tab-panel",
    templateUrl: "tab-panel.component.html"
})

export class IgxTabPanelComponent implements AfterContentInit {
    private _itemStyle = "igx-tab-panel";
    public isSelected = false;

    @Input() public label: string;
    @Input() public icon: string;
    @Input() public isDisabled: boolean;

    @HostBinding("attr.role") public role = "tabpanel";

    @HostBinding("class.igx-tab-bar__panel")
    get styleClass(): boolean {
        return (!this.isSelected);
    }
    @HostBinding("class.igx-tab-bar__panel--selected")
    get selected(): boolean {
        return this.isSelected;
    }
    @HostBinding("attr.aria-labelledby")
    get labelledBy(): string {
        return "igx-tab-" + this.index;
    }

    @HostBinding("attr.id")
    get id(): string {
        return "igx-tab-bar__panel-" + this.index;
    }

    public get itemStyle(): string {
        return this._itemStyle;
    }

    get relatedTab(): IgxTabComponent {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }
    }
    get index() {
        return this._tabBar.panels.toArray().indexOf(this);
    }

    get customTabTemplate(): TemplateRef<any> {
        return this._tabTemplate;
    }

    set customTabTemplate(template: TemplateRef<any>) {
        this._tabTemplate = template;
    }

    private _tabTemplate: TemplateRef<any>;

    @ContentChild(IgxTabTemplateDirective, { read: IgxTabTemplateDirective })
    protected tabTemplate: IgxTabTemplateDirective;

    constructor(private _tabBar: IgxTabBarComponent) {
    }

    public ngAfterContentInit(): void {
        if (this.tabTemplate) {
            this._tabTemplate = this.tabTemplate.template;
        }
    }

    public select() {
        if (this.isDisabled || this._tabBar.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar.onTabSelected.emit({ tab: this._tabBar.tabs.toArray()[this.index], panel: this });
    }
}

// ======================================= IgxTabComponent ==========================================

@Component({
    selector: "igx-tab",
    templateUrl: "tab.component.html"
})

export class IgxTabComponent {

    @HostBinding("attr.role") public role = "tab";

    @Input() public relatedPanel: IgxTabPanelComponent;

    private _changesCount = 0; // changes and updates accordingly applied to the tab.

    get changesCount(): number {
        return this._changesCount;
    }

    get isDisabled(): boolean {
        const panel = this.relatedPanel;

        if (panel) {
            return panel.isDisabled;
        }
    }

    get isSelected(): boolean {
        const panel = this.relatedPanel;

        if (panel) {
            return panel.isSelected;
        }
    }

    get index(): number {
        return this._tabBar.tabs.toArray().indexOf(this);
    }

    constructor(private _tabBar: IgxTabBarComponent, private _element: ElementRef) {
    }

    public select() {
        this.relatedPanel.select();
    }
}

@NgModule({
    declarations: [IgxTabBarComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
    exports: [IgxTabBarComponent, IgxTabPanelComponent, IgxTabComponent, IgxTabTemplateDirective],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule]
})
export class IgxTabBarModule {
}
