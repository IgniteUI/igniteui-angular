import { NgModule, Component, Input, Output, ElementRef, ViewChild, ViewChildren, QueryList, ContentChildren, AfterViewInit, AfterContentChecked, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";

type TabbarAlignments = "top" | "bottom";

@Component({
    selector: 'igx-tab-bar',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-bar-content.component.html'
})

export class IgxTabBar implements AfterViewInit, AfterContentChecked {
    @ViewChild('tablist') _tabList: ElementRef;
    @ViewChildren(forwardRef(() => IgxTab)) tabs: QueryList<IgxTab>;
    @ContentChildren(forwardRef(() =>IgxTabPanel)) panels: QueryList<IgxTabPanel>;

    //private _INITIALLY_DISPLAYED_TABS_COUNT: number = 5;
    //private get _visibleTabs() {
    //    return this.tabs.length > this._INITIALLY_DISPLAYED_TABS_COUNT ? this.tabs.filter(tab => tab.index < this._INITIALLY_DISPLAYED_TABS_COUNT - 1) : this.tabs.toArray();
    //}
    private _itemStyle: string = "igx-tab-bar";

    selectedIndex: number = -1;    

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    private get _tabListHeight() {
        if (this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }

        return 0;
    }
   
    get selectedTab(): IgxTab {
        if (this.tabs && this.selectedIndex != undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }    

    @Input() alignment: TabbarAlignments = "top";    

    @Output() onTabSelected = new EventEmitter();
    @Output() onTabDeselected = new EventEmitter();

    constructor(private _element: ElementRef) {
    }

    ngAfterContentChecked() {

        this.panels.forEach((panel) => {
            let tabListHeight = this._tabListHeight;
            panel.height = this._height - tabListHeight;

            if (this.alignment == "top") {
                panel.marginTop = tabListHeight;
            } else if (this.alignment == "bottom") {
                panel.marginTop = 0;
            }
        });
    }

    ngAfterViewInit() {            

        // initial selection
        setTimeout(() => {
            if (!this.selectedTab) {
                var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
                    tab = selectableTabs[0];

                if (tab) {
                    tab.select();
                }
            }
        }, 0);
    }


    _selectedTabCallback(selectedIndex: number) {
        this.selectedIndex = selectedIndex;               

        this.panels.forEach((p) => {
            if (p.index != selectedIndex) {
                p._deselect();                
            }
        });

        this.onTabSelected.emit({ tab: this.tabs[selectedIndex], panel: this.panels[selectedIndex] });
    }

    _deselectedTabCallback(index: number) {
        this.onTabDeselected.emit({ tab: this.tabs[index], panel: this.panels[index] });
    }
}

//========================================================== IgxTabPanel ================================================

@Component({
    selector: 'igx-tab-panel',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-panel.component.html',
    host: {
        'role': "tabpanel",
        '[id]': "'igx-tab-bar__panel-' + index",
        '[attr.aria-labelledby]': "'igx-tab-' + index",
        '[class.igx-tab-bar__panel]': '!isSelected',
        '[class.igx-tab-bar__panel--selected]': "isSelected"
    }
})

export class IgxTabPanel {
    private _itemStyle: string = "igx-tab-panel-inner";

    isSelected: boolean = false;
    height: number | string;
    marginTop: number | string;

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

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
    }

    select() {
        if (this.isDisabled || this._tabBar.selectedIndex == this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar._selectedTabCallback(this.index);
    }

    _deselect() {
        // Cannot deselect the selected tab - this will mean that there will be not selected tab left
        if (this.isDisabled || this._tabBar.selectedTab.index == this.index) {
            return;
        }

        this.isSelected = false;
        this._tabBar._deselectedTabCallback(this.index);
    }
}

//========================================================== IgxTab ================================================

@Component({
    selector: 'igx-tab',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab.component.html',
    host: {
        'role': "tab",
        'class': "igx-tab-bar__menu-item"
    }
})

export class IgxTab {
    @Input() relatedPanel: IgxTabPanel;

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.       

    get isDisabled(): boolean {
        var panel = this.relatedPanel;

        if (panel) {
            return panel.isDisabled;
        }

        return false;
    }

    get isSelected(): boolean {
        var panel = this.relatedPanel;

        if(panel) {
            return panel.isSelected;
        }           

        return false;
    };

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