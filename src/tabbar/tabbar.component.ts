import { NgModule, Component, Input, Output, ElementRef, ViewChild, ViewChildren, QueryList, ContentChildren, AfterViewInit, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
    selector: 'igx-tab-bar',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-bar-content.component.html',
    //host: {
    //    '(selectTab)': 'selectedTabHandler($event)'
    //}
})

export class IgxTabBar implements AfterViewInit {
    @ViewChild('tablist') _tabList: ElementRef;
    @ViewChildren(forwardRef(() => IgxTab)) tabs: QueryList<IgxTab>;
    @ContentChildren(forwardRef(() =>IgxTabPanel)) tabPanels: QueryList<IgxTabPanel>;

    private _INITIALLY_DISPLAYED_TABS_COUNT: number = 5;
    private _itemStyle: string = "igx-tab-bar-inner";

    selectedIndex: number;

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
        if (this.tabs && this.selectedIndex != undefined) {
            return this.tabs.toArray()[this.selectedIndex];
        }
    }    

    @Input() alignment: string = "top";    

    @Output() selectTab = new EventEmitter();
    @Output() deselectTab = new EventEmitter();

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
        if (!this.selectedTab) {
            var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
                tab = selectableTabs[0];

            if (tab) {
                tab.select();
            }
        }
    }

    selectedTabCallback(tab: IgxTab) {
        let selectedIndex = tab.index;

        this.selectedIndex = selectedIndex;

        this.selectTab.emit({ tab: tab });       

        this.tabs.forEach((t) => {
            if (t.index != selectedIndex) {
                t.deselect();                
            }
        });
    }

    deselectedTabCallback(tab: IgxTab) {
        this.deselectTab.emit({ tab: tab });
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

export class IgxTabPanel implements AfterViewInit {
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

    @Input() label: string;
    @Input() icon: string;
    @Input() color: string;
    @Input() disabled: boolean;

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef, private cdr: ChangeDetectorRef) {
        //let tab = new IgxTab(_tabBar, null);
        //tab.color = this.color;
        //tab.icon = this.icon;
        //tab.label = this.label;
        //tab.isDisabled = this.disabled;
    }

    ngAfterViewInit() {
        let tab: IgxTab;

        if (this._tabBar.tabs)
        {
            //tab = this._tabBar.tabs.toArray()[this.index];

            //tab.color = this.color;
            //tab.icon = this.icon;
            //tab.label = this.label;
            //tab.isDisabled = this.disabled;

            //this.cdr.detectChanges();
        }         
    }
}

//========================================================== IgxTab ================================================

@Component({
    selector: 'igx-tab',
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab.component.html',
    host: {
        'role': "tab",
        'class': "igx-tab-inner__menu-item",
        '(click)': "select()"
    }
})

export class IgxTab {
    @Input() label: string;
    @Input() icon: string;
    @Input() color: string;
    @Input() isDisabled: boolean;

    //label: string;
    //icon: string;
    //color: string;
    //isDisabled: boolean;
    isSelected: boolean;   

    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

    get index(): number {
        return this._tabBar.tabs.toArray().indexOf(this);
    }       

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
    }

    select() {
        if (this.isDisabled && this._tabBar.selectedIndex == this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar.selectedTabCallback(this);
    }

    deselect() {
        if (this.isDisabled) {
            return;
        }

        this.isSelected = false;
        this._tabBar.deselectedTabCallback(this); 
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}