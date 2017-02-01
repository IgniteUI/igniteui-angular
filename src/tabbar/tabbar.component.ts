import { NgModule, Component, Input, Output, ElementRef, ViewChild, ViewChildren, QueryList, ContentChildren, AfterViewInit, AfterContentChecked, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from "@angular/common";

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

    @Output() onTabSelected = new EventEmitter();
    @Output() onTabDeselected = new EventEmitter();

    constructor(private _element: ElementRef) {
    }

    ngAfterContentChecked() {
        //var self = this;

        //this.panels.forEach((panel) => {
        //    let tabListHeight = self.tabListHeight;
        //    panel.height = self._height - tabListHeight;

        //    if (self.alignment == "top") {
        //        panel.marginTop = tabListHeight;
        //    } else if (self.alignment == "bottom") {
        //        panel.marginTop = 0;
        //    }
        //});

        this.panels.forEach((panel) => {
            let tabListHeight = this.tabListHeight;
            panel.height = this._height - tabListHeight;

            if (this.alignment == "top") {
                panel.marginTop = tabListHeight;
            } else if (this.alignment == "bottom") {
                panel.marginTop = 0;
            }
        });

        //if (!this.selectedTab) {
        //    let selectablePanels = this.panels.filter((panel) => !panel.isDisabled),
        //        panel = selectablePanels[0];

        //    if (panel) {
        //        panel.select();
        //    }
        //}
    }

    ngAfterViewInit() {            

        // initial selection
        //setTimeout(() => {
            if (!this.selectedTab) {
                var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
                    tab = selectableTabs[0];

                if (tab) {
                    tab.select();
                }
            }
        //}, 0);
    }


    selectedTabCallback(selectedIndex: number) {
        this.selectedIndex = selectedIndex;               

        this.panels.forEach((p) => {
            if (p.index != selectedIndex) {
                p.deselect();                
            }
        });

        this.onTabSelected.emit({ tab: this.tabs[selectedIndex], panel: this.panels[selectedIndex] });
    }

    deselectedTabCallback(index: number) {
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
        '[class.selected]': "isSelected"
    }
})

export class IgxTabPanel {
    //@ViewChild('tab_panel_container') _panelTemplateContainer: ElementRef;

    private _itemStyle: string = "igx-tab-panel-inner";

    isSelected: boolean = false;
    height: number | string;
    marginTop: number | string;

    get relatedTab(): IgxTab {
        if (this._tabBar.tabs) {
            return this._tabBar.tabs.toArray()[this.index];
        }        
    }

    //private getPanelTemplateContainerStyle() {
    //    if (this._panelTemplateContainer && this._panelTemplateContainer.nativeElement) {
    //        return this._panelTemplateContainer.nativeElement.style;
    //    }
    //}

    get index() {
        return this._tabBar.panels.toArray().indexOf(this);
    }    

    //get height() {
    //    var style = this.getPanelTemplateContainerStyle();

    //    if (style) {
    //        return style.height;
    //    }        
    //}

    //set height(value: number) {
    //    var style = this.getPanelTemplateContainerStyle();

    //    if (style) {
    //        style.height = value + "px";
    //    }
    //}

    //get marginTop() {
    //    var style = this.getPanelTemplateContainerStyle();

    //    if (style) {
    //        return style.marginTop;
    //    }
    //}

    //set marginTop(value: number) {
    //    var style = this.getPanelTemplateContainerStyle();

    //    if (style) {
    //        style.marginTop = value + "px";
    //    }
    //}
    
    @Input() label: string;
    @Input() icon: string;
    @Input() color: string;
    @Input() isDisabled: boolean;

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
    }

    select() {
        if (this.isDisabled && this._tabBar.selectedIndex == this.index) {
            return;
        }

        this.isSelected = true;
        this._tabBar.selectedTabCallback(this.index);
    }

    deselect() {
        if (this.isDisabled) {
            return;
        }

        this.isSelected = false;
        this._tabBar.deselectedTabCallback(this.index);
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
        //'(click)': "select()",
        //'[attr.aria-disabled]': "isDisabled",
        //'[attr.aria-selected]': "isSelected",
        //'[attr.aria-label]': "label",
        //'[class.igx-tab-bar-inner__menu-item--selected]': "isSelected",
        //'[class.igx-tab-bar-inner__menu-item--disabled]': "isDisabled"
    }
})

export class IgxTab {
    //@Input() label: string;
    //@Input() icon: string;
    //@Input() color: string;
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

    //get relatedPanel(): IgxTabPanel {
    //    return this._tabBar.panels.toArray()[this.index];
    //}    

    get index(): number {
        return this._tabBar.tabs.toArray().indexOf(this);
    }       

    constructor(private _tabBar: IgxTabBar, private _element: ElementRef) {
    }

    select() {
        this.relatedPanel.select();
    }

    deselect() {
        this.relatedPanel.deselect(); 
    }
}

@NgModule({
    declarations: [IgxTabBar, IgxTabPanel, IgxTab],
    imports: [CommonModule],
    exports: [IgxTabBar, IgxTabPanel, IgxTab]
})
export class IgxTabBarModule {
}