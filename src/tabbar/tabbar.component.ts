import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, forwardRef, Input, NgModule, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";

@Component({
    selector: "igx-tab-bar",
    moduleId: module.id, // commonJS standard
    templateUrl: "tab-bar-content.component.html",
    host: {
        "(onTabSelected)": "_selectedPanelHandler($event)"
    }
})

export class IgxTabBar implements AfterViewInit {
    @ViewChildren(forwardRef(() => IgxTab)) public tabs: QueryList<IgxTab>;
    @ContentChildren(forwardRef(() => IgxTabPanel)) public panels: QueryList<IgxTabPanel>;

    @Output() public onTabSelected = new EventEmitter();
    @Output() public onTabDeselected = new EventEmitter();

    public selectedIndex: number = -1;

    private _itemStyle: string = "igx-tab-bar";

    get selectedTab(): IgxTab {
        if (this.tabs && this.selectedIndex != undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }

    constructor(private _element: ElementRef) {
    }

    public ngAfterViewInit() {
        // initial selection
        setTimeout(() => {
            if (this.selectedIndex === -1) {
				const selectablePanels = this.panels.filter((panel) => !panel.isDisabled);
				const panel = selectablePanels[0];

				if (panel) {
					panel.select();
				}
            }
        }, 0);
    }

    private _selectedPanelHandler(args) {
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
        "role": "tabpanel",
    },
    moduleId: module.id, // commonJS standard
    selector: "igx-tab-panel",
    templateUrl: "tab-panel.component.html",
})

export class IgxTabPanel {
    private _itemStyle: string = "igx-tab-panel";

    isSelected: boolean = false;

    get relatedTab(): IgxTab {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }
    }

    get index() {
        return this._tabBar.panels.toArray().indexOf(this);
    }

    @Input() label: string;
    @Input() icon: string;
    @Input() isDisabled: boolean;

    constructor(private _tabBar: IgxTabBar) {
    }

    select() {
        if (this.isDisabled || this._tabBar.selectedIndex == this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar.onTabSelected.emit({ tab: this._tabBar.tabs.toArray()[this.index], panel: this });
    }
}

//========================================================== IgxTab ================================================

@Component({
    selector: "igx-tab",
    moduleId: module.id, // commonJS standard
    templateUrl: "tab.component.html",
    host: {
        role: "tab",
        class: "igx-tab-bar__menu-item"
    }
})

export class IgxTab {
    @Input() relatedPanel: IgxTabPanel;

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

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

    select() {
        this.relatedPanel.select();
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}
