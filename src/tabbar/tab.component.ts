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
        return this.tabbarContainers.length > this._maxNumberTabsDisplayed ? this.tabbarContainers.filter(container => container.index < this._maxNumberTabsDisplayed - 1) : this.tabbarContainers;
    }

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    private get _columns() {
        return this.tabbarContainers.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabbarContainers.length;
    }

    get tabListHeight() {
        if (this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }

        return 0;
    }

    tabbarContainers: IgxTabPanel[] = [];
    tabs: IgxTab[] = [];

    get selectedTab() {
        var selectedContainers = this.tabbarContainers.filter((container) => container.isSelected);

        if (selectedContainers.length == 0) {
            return undefined;
        } else {
            return selectedContainers[selectedContainers.length - 1];
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

        this.tabbarContainers.forEach((tab) => {
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
        this.tabbarContainers.push(container);
        this.tabbarContainers.forEach((container) => { container.columnCount = this._columns; });
        this.tabs.push(new IgxTab());
    }

    remove(index: number) {
        var tab;

        if (!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabbarContainers[index];

        if (tab.isSelected) {
            tab.isSelected = false;
        }

        this.tabbarContainers.splice(index, 1);
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
        return index <= this.tabbarContainers.length - 1 && index >= 0;
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

    private _itemStyle: string = "igx-tab-inner";
    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

    isSelected: boolean = false;

    get index() {
        return this._tabBar.tabbarContainers.indexOf(this);
    }

    get isDisabled() {
        return this.disabled !== undefined;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
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

    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    @Input() color: string;

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
        this._tabBar.add(this);
    }

    select() {
        this._tabBar.select(this.index);
    }

    deselect() {
        this._tabBar.deselect(this.index);
    }
}

//========================================================== IgxTab ================================================

@Component({
    selector: 'igx-tab',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab.component.html',
    host: {
        'role': "tab"
    }
})

export class IgxTab {
    @Input() label: string;
    @Input() icon: string;
    @Input() color: string;

    index: number;
    isDisabled: boolean;
    isSelected: boolean;
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}