import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    NgModule,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import { IgxBadgeModule } from "../badge/badge.component";
import { IgxIconModule } from "../icon/icon.component";
@Component({
    encapsulation: ViewEncapsulation.None,
    host: {
        "(onTabSelected)": "_selectedPanelHandler($event)"
    },
    selector: "igx-tab-bar",
    styleUrls: ["./tabbar.component.scss"],
    templateUrl: "tab-bar-content.component.html"
})

export class IgxTabBar implements AfterViewInit {
    @ViewChildren(forwardRef(() => IgxTab)) public tabs: QueryList<IgxTab>;
    @ContentChildren(forwardRef(() => IgxTabPanel)) public panels: QueryList<IgxTabPanel>;

    @Output() public onTabSelected = new EventEmitter();
    @Output() public onTabDeselected = new EventEmitter();

    public selectedIndex: number = -1;

    public get itemStyle(): string {
        return this._itemStyle;
    }

    private _itemStyle: string = "igx-tab-bar";

    get selectedTab(): IgxTab {
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

    public _selectedPanelHandler(args) {
        this.selectedIndex = args.panel.index;

        this.panels.forEach((p) => {
            if (p.index !== this.selectedIndex) {
                this._deselectPanel(p);
            }
        });
    }

    private _deselectPanel(panel: IgxTabPanel) {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (panel.isDisabled || this.selectedTab.index === panel.index) {
            return;
        }

        panel.isSelected = false;
        this.onTabDeselected.emit({ tab: this.tabs[panel.index], panel });
    }
}

// ================================= IgxTabPanel ======================================

@Component({
    host: {
        "[attr.aria-labelledby]": "'igx-tab-' + index",
        "[class.igx-tab-bar__panel--selected]": "isSelected",
        "[class.igx-tab-bar__panel]": "!isSelected",
        "[id]": "'igx-tab-bar__panel-' + index",
        "role": "tabpanel"
    },
    selector: "igx-tab-panel",
    templateUrl: "tab-panel.component.html"
})

export class IgxTabPanel {
    public isSelected: boolean = false;

    @Input() public label: string;
    @Input() public icon: string;
    @Input() public isDisabled: boolean;

    public get itemStyle(): string {
        return this._itemStyle;
    }
    private _itemStyle: string = "igx-tab-panel";

    get relatedTab(): IgxTab {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }
    }

    get index() {
        return this._tabBar.panels.toArray().indexOf(this);
    }

    constructor(private _tabBar: IgxTabBar) {
    }

    public select() {
        if (this.isDisabled || this._tabBar.selectedIndex === this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar.onTabSelected.emit({ tab: this._tabBar.tabs.toArray()[this.index], panel: this });
    }
}

// ======================================= IgxTab ==========================================

@Component({
    host: {
        class: "igx-tab-bar__menu-item",
        role: "tab"
    },
    selector: "igx-tab",
    templateUrl: "tab.component.html"
})

export class IgxTab {
    @Input() public relatedPanel: IgxTabPanel;

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

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

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
    }

    public select() {
        this.relatedPanel.select();
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    exports: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule, IgxBadgeModule, IgxIconModule]
})
export class IgxTabBarModule {
}
