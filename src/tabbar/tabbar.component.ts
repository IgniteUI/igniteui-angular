import { Component, Input, Output, ElementRef, ViewChild, AfterViewInit, AfterContentInit, EventEmitter, NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'igx-tab-bar',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-bar-content.component.html'
})

export class IgxTabBar implements AfterViewInit, AfterContentInit {
    @ViewChild('tablist') _tabList: ElementRef;

    private _maxNumberTabsDisplayed: number = 5;
    private _itemStyle: string = "igx-tab-bar-inner";
    private get _visibleTabs() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this.tabs.filter(tab => tab.index < this._maxNumberTabsDisplayed - 1) : this.tabs;
    }

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    private get _columns() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabs.length;
    }

    get tabListHeight() {
        if (this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }

        return 0;
    }

    tabPanels: IgxTabPanel[] = [];
    tabs: IgxTab[] = [];

    get selectedTab(): IgxTab {
        var selectedTabs = this.tabs.filter((tab) => tab.isSelected);

        if (selectedTabs.length) {
            // insurance in case selectedTabs.length > 1 - take the last selected
            return selectedTabs[selectedTabs.length - 1];
        }
    }

    get selectedIndex() : number {
        return this.selectedTab ? this.selectedTab.index : undefined;
    }

    @Input() alignment: string = "top";

    @Output() selectTab = new EventEmitter();
    @Output() deselectTab = new EventEmitter();

    constructor(private _element: ElementRef) {
    }

    ngAfterContentInit() {
        // initial selection
        if (!this.selectedTab) {
            var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
                tab = selectableTabs[0];

            if (tab) {
                this.select(tab.index);
            }
        }
    }

    ngAfterViewInit() {
        var self = this;

        this.tabPanels.forEach((panel) => {
            let tabListHeight = self.tabListHeight;
            panel.height = self._height - tabListHeight;
            if (self.alignment == "top") {
                panel.marginTop = tabListHeight;
            } else if (self.alignment == "bottom") {
                panel.marginTop = 0;
            }
        });
    }

    add(panel: IgxTabPanel) {
        let columns;
        this.tabPanels.push(panel);
        
        this.tabs.push(new IgxTab(this));
        columns = this._columns;
        this.tabs.forEach((tab) => { tab.columnCount = columns; });
    }

    remove(index: number) {
        var tab, panel;

        if (!this._validateIndex(index)) {
            return;
        }

        panel = this.tabPanels[index];
        tab = this.tabs[index]; 

        if (tab.isSelected) {
            tab.isSelected = false;
        }

        this.tabPanels.splice(index, 1);
        this.tabs.splice(index, 1);
    }

    select(index: number) {
        var tab, self = this;

        if (!this._validateIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if (tab.isDisabled) {
            return;
        }

        this.tabs.forEach((tab) => {
            if (tab.index != index) {
                self.deselect(tab.index);
            }
        });

        tab.isSelected = true;

        this.selectTab.emit({ index: index, tab: tab });
    }

    deselect(index: number) {
        var tab;

        if (!this._validateIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if (!tab.isDisabled && tab.isSelected) {
            tab.isSelected = false;
            this.deselectTab.emit({ index: index, tab: tab });
        }        
    }

    private _selectTabMore() {
        alert("Tab 'More' is clicked");
    }

    private _validateIndex(index) {
        return index <= this.tabPanels.length - 1 && index >= 0;
    }
}

//========================================================== IgxTabPanel ================================================

@Component({
    selector: 'igx-tab-panel',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-panel.component.html',
    host: {
        'role': "tabpanel",
        '[class.selected]': "isSelected"
    }
})

export class IgxTabPanel {
    @ViewChild('tab_panel_container') _wrapper: ElementRef;

    private _itemStyle: string = "igx-tab-panel-inner";
    isSelected: boolean = false;
    relatedTab: IgxTab;

    get index() {
        return this._tabBar.tabPanels.indexOf(this);
    }    

    get height() {
        return this._wrapper.nativeElement.style.height;
    }

    set height(value: number) {
        this._wrapper.nativeElement.style.height = value + "px";
    }

    get marginTop() {
        return this._wrapper.nativeElement.style.marginTop;
    }

    set marginTop(value: number) {
        this._wrapper.nativeElement.style.marginTop = value + "px";
    }

    @Input() set label(value: string) {
        this.relatedTab.label = value;
    };

    @Input() set icon(value: string) {
        this.relatedTab.icon = value;
    };

    @Input() set color(value: string) {
        this.relatedTab.color = value;
    };

    @Input() set disabled(value: boolean) {
        this.relatedTab.isDisabled = value !== undefined;
    };

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
        this._tabBar.add(this);
        this.relatedTab = _tabBar.tabs[this.index];
    }
}

//========================================================== IgxTab ================================================

@Component({
    selector: 'igx-tab',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab.component.html',
    host: {
        'role': "tab",
        'class': "igx-tab-inner__menu-item"
    }
})

export class IgxTab {
    label: string;
    icon: string;
    color: string;
    isDisabled: boolean;

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.    

    isSelected: boolean = false;
    relatedPanel: IgxTabPanel;

    get index() : number {
        return this._tabBar.tabs.indexOf(this);
    }    
    
    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    constructor(private _tabBar: IgxTabBar /*, private _element: ElementRef*/) {
        this.relatedPanel = _tabBar.tabPanels[this.index];
    }

    select() {
        this._tabBar.select(this.index);
    }

    deselect() {
        this._tabBar.deselect(this.index);
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}