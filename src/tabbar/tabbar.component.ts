import { Component, Input, Output, ElementRef, ViewChild, ViewChildren, QueryList, ContentChildren, AfterViewInit, AfterContentInit, EventEmitter, NgModule, forwardRef } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'igx-tab-bar',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-bar-content.component.html'
})

export class IgxTabBar implements AfterViewInit {
    @ViewChild('tablist') _tabList: ElementRef;
    @ViewChildren(forwardRef(() => IgxTab)) tabs: QueryList<IgxTab>;
    @ContentChildren(forwardRef(() =>IgxTabPanel)) tabPanels: QueryList<IgxTabPanel>;

    private _INITIALLY_DISPLAYED_TABS_COUNT: number = 5;
    private _itemStyle: string = "igx-tab-bar-inner";

    //private get _visibleTabs() {
    //    return this.tabs.length > this._INITIALLY_DISPLAYED_TABS_COUNT ? this.tabs.filter(tab => tab.index < this._INITIALLY_DISPLAYED_TABS_COUNT - 1) : this.tabs.toArray();
    //}

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    get tabListHeight() {
        if (this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }

        return 0;
    }
   
    get selectedTab(): IgxTab {
        //var selectedTabs = this.tabs.filter((tab) => tab.isSelected);

        //if (selectedTabs.length) {
        //    // insurance in case selectedTabs.length > 1 - take the last selected
        //    return selectedTabs[selectedTabs.length - 1];
        //}
        return null;
    }

    get selectedIndex() : number {
        return this.selectedTab ? this.selectedTab.index : undefined;
    }

    @Input() alignment: string = "top";    

    constructor(private _element: ElementRef) {
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

        // initial selection
        //if (!this.selectedTab) {
        //    var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
        //        tab = selectableTabs[0];

        //    if (tab) {
        //        tab.select();
        //    }
        //}
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

    get index() {
        return this._tabBar.tabPanels.toArray().indexOf(this);
    }    

    get height() {
        if (this._wrapper && this._wrapper.nativeElement) {
            return this._wrapper.nativeElement.style.height;
        }        
    }

    set height(value: number) {
        if (this._wrapper && this._wrapper.nativeElement) {
            this._wrapper.nativeElement.style.height = value + "px";
        }
    }

    get marginTop() {
        if (this._wrapper && this._wrapper.nativeElement) {
            return this._wrapper.nativeElement.style.marginTop;
        }
    }

    set marginTop(value: number) {
        if (this._wrapper && this._wrapper.nativeElement) {
            this._wrapper.nativeElement.style.marginTop = value + "px";
        }
    }
    
    //@Input() set label(value: string) {
    //    //this._tabBar.tabs[this.index].label = value;
    //};

    //@Input() set icon(value: string) {
    //    //this._tabBar.tabs[this.index].icon = value;
    //};

    //@Input() set color(value: string) {
    //    //this._tabBar.tabs[this.index].color = value;
    //};

    //@Input() set disabled(value: boolean) {
    //    //this._tabBar.tabs[this.index].isDisabled = value !== undefined;
    //};

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
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
    isSelected: boolean;   

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

    get index(): number {
        return this._tabBar.tabs.toArray().indexOf(this);
    }    

    @Output() selectTab = new EventEmitter();
    @Output() deselectTab = new EventEmitter();

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {        
    }

    select() {
        this.isSelected = true;
        this.selectTab.emit({ tab: this });
    }

    deselect() {
        this.isSelected = false;
        this.deselectTab.emit({ tab: this });
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}