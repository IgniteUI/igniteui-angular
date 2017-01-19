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
        return this.tabPanels.length > this._maxNumberTabsDisplayed ? this.tabPanels.filter(container => container.index < this._maxNumberTabsDisplayed - 1) : this.tabPanels;
    }

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    private get _columns() {
        return this.tabPanels.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabPanels.length;
    }

    get tabListHeight() {
        if (this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }

        return 0;
    }

    tabPanels: IgxTabPanel[] = [];
    tabs: IgxTab[] = [];

    get selectedTab() {
        var selectedTabs = this.tabs.filter((tab) => tab.isSelected);

        if (selectedTabs.length == 0) {
            return undefined;
        } else {
            return selectedTabs[selectedTabs.length - 1];
        }
    }

    get selectedIndex() {
        if (this.selectedTab) {
            return this.selectedTab.index;
        }

        return undefined;
    }

    @Input() alignment: string = "top";

    @Output() selectTab = new EventEmitter();

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

        this.tabPanels.forEach((tab) => {
            let tabListHeight = self.tabListHeight;
            tab.height = self._height - tabListHeight;
            if (self.alignment == "top") {
                tab.marginTop = tabListHeight;
            } else if (self.alignment == "bottom") {
                tab.marginTop = 0;
            }
        });
    }

    add(container: IgxTabPanel) {
        this.tabPanels.push(container);
        
        this.tabs.push(new IgxTab(this));
        this.tabs.forEach((tab) => { tab.columnCount = this._columns; });
    }

    remove(index: number) {
        var tab;

        if (!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabPanels[index];

        if (tab.isSelected) {
            tab.isSelected = false;
        }

        this.tabPanels.splice(index, 1);
    }

    select(index: number) {
        var tab, self = this;

        if (!this._validateTabIndex(index)) {
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

        if (!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if (!tab.isDisabled && tab.isSelected) {
            tab.isSelected = false;
        }
    }

    private _selectTabMore() {
        alert("Tab More is clicked");
    }

    private _validateTabIndex(index) {
        return index <= this.tabPanels.length - 1 && index >= 0;
    }
}

//========================================================== IgxTabbarContainer ================================================

@Component({
    selector: 'igx-tab-panel',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-panel.component.html',
    host: {
        'role': "tabpanel"
    }
})

export class IgxTabPanel {
    @ViewChild('tab_panel_container') _wrapper: ElementRef;

    private _itemStyle: string = "igx-tab-panel-inner";
    isSelected: boolean = false;

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

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    @Input() color: string;

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
        this._tabBar.add(this);
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
    @Input() label: string;
    @Input() icon: string;
    @Input() color: string;

    private _disabled: boolean;
    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.    

    isSelected: boolean = false;

    get index() : number {
        return this._tabBar.tabs.indexOf(this);
    }

    get isDisabled(): boolean {
        return this._disabled !== undefined;
    }

    set isDisabled(value: boolean) {
        this._disabled = value;
    }
    
    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    constructor(private _tabBar: IgxTabBar /*, private _element: ElementRef*/) {
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