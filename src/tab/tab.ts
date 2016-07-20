import { Component, Input, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';

declare var module: any;

@Component({
  selector: 'ig-tab-bar',
  moduleId: module.id, // commonJS standard
  templateUrl: 'tab-bar-content.html'
})

export class TabBar implements AfterViewInit, AfterContentInit  {
    @ViewChild('unorderedList') _tabList: ElementRef;

    private _maxNumberTabsDisplayed: number = 5;
    private _itemStyle: string = "ig-tab-bar-inner";
    private _element: ElementRef;
    private get _visibleTabs() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this.tabs.filter(t => t.index < this._maxNumberTabsDisplayed - 1) : this.tabs;
    }

    tabs: Tab[] = [];
    selectedTab: Tab;
    selectedIndex: number = 0;

    @Input() alignment: string = "top";

    constructor(element: ElementRef) {
        this._element = element;        
    }

    ngAfterContentInit() {
        // initial selection
        if(!this.selectedTab) {
            var selectableTabs = this.tabs.filter((tab) => !tab.isDisabled),
            tab = selectableTabs[0];

            if(tab) {
                this.select(tab.index);
            }            
        }    
    }

    ngAfterViewInit() {
        var self = this;

        this.tabs.forEach((tab) => { 
            let tabListHeight = self._getTabListHeight();
            tab.setHeight(self._getHeight() - tabListHeight);
            if(self.alignment == "top") {
                tab.setMargin(tabListHeight);
            }
        });             
    }

    add(tab: Tab) {
        this.tabs.push(tab);
        this.tabs.forEach((tab) => { tab.columnCount = this._getColumns(); });
    }

    remove(index: number) {
        var tab;

        if(!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if(tab.isSelected) {
            tab.isSelected = false;
        }
        
        this.tabs.splice(index, 1);
    }

    select(index: number) {
        var tab;

        if(!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabs[index];


        if(tab.isDisabled) {
            return;
        }

        this.tabs.forEach((tab) => { tab.deselect(); });
        tab.isSelected = true;

        this.selectedIndex = index;
        this.selectedTab = tab;
    }

    private _selectTabMore() {
        alert("Tab More is clicked");
    }

    private _getColumns() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabs.length ;
    }

    private _getHeight() {
        return this._element.nativeElement.offsetHeight;
    }

    private _getTabListHeight() {
        if(this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }
        
        return 0;
    }

    private _validateTabIndex(index) {
        return index <= this.tabs.length - 1 && index >= 0;
    }
}

@Component({
  selector: 'ig-tab',
  moduleId: module.id, // commonJS standard
  templateUrl: 'tab-content.html',
  host: { 
    '[class]': '"col-" + columnCount'
   }
})

export class Tab {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _itemStyle: string = "ig-tab-inner";    
    private _tabBar: TabBar;
    // changes and updates accordingly applied to the tab. 
    private _changesCount: number = 0;
    private _element: ElementRef;

    index: number;
    height: number;    
    isSelected: boolean = false;
    get isDisabled() { 
        return this.disabled !== undefined;
    }

    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    @Input() href: string;   // TODO - need to be disccussed

      constructor(tabBar: TabBar, element: ElementRef) {
        this._tabBar = tabBar;
        this._element = element;
        this._tabBar.add(this);
        this.index = this._tabBar.tabs.length - 1;
      }

      click() {
        if(this.href) {
                // TODO - href implementation. Priority over nested content
            } else {
                this.select();
            }        
      }

      select() {
        this._tabBar.select(this.index);
      }

      deselect() {
        this.isSelected = false;
      }

      setHeight(height: number){
        this.wrapper.nativeElement.style.height = height + "px";
      }

      setMargin(margin: number){
        this.wrapper.nativeElement.style.marginTop = margin + "px";
      }
}