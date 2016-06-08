import { Component, Input, ElementRef, ViewChild, AfterViewInit  } from 'angular2/core';

declare var module: any;

@Component({
  selector: 'ig-tab-bar',
  moduleId: module.id, // commonJS standard
  templateUrl: 'tab-bar-content.html'
})

export class TabBar implements AfterViewInit  {
    @ViewChild('unorderedList') _tabList: ElementRef;

    private _maxNumberTabsDisplayed: number = 5;
    private _itemStyle: string = "ig-tab-bar-inner";
    private _element: ElementRef;
    private get _visibleTabs(): Tab[] {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this.tabs.filter(t => t.index < this._maxNumberTabsDisplayed - 1) : this.tabs;
    }

    tabs: Tab[] = [];

    @Input() alignment: string = "top";

    constructor(element: ElementRef) {
        this._element = element;
    }

    ngAfterViewInit() {
        this.tabs.forEach((tab) => { 
            let tabListHeight = this.getTabListHeight();
            tab.setHeight(this.getHeight() - tabListHeight);
            if(this.alignment == "top") {
                tab.setMargin(tabListHeight);
            }
        } );         
    }

    add(tab: Tab) {
        this.tabs.push(tab);
        this.tabs.forEach((tab) => { tab.columnCount = this.getColumns(); });
    }

    selectTab(tab: Tab) {
        if(tab.isDisabled) {
            return;
        }

        this.tabs.forEach((tab) => { tab.isSelected = false; });
        tab.isSelected = true;
    }

    selectTabMore() {
        alert("Tab More is clicked");
    }

    getColumns() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabs.length ;
    }

    getHeight() {
        return this._element.nativeElement.offsetHeight;
    }

    getTabListHeight() {
        if(this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }
        
        return 0;
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

export class Tab  {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _itemStyle: string = "ig-tab-inner";    
    private _tabBar: TabBar;
    // changes and updates accordingly applied to the tab. 
    private _changesCount: number = 0;
    private _element: ElementRef;

    index: number;
    height: number;    
    isSelected: boolean = false;
    get isDisabled(): boolean { 
        return this.disabled !== undefined;
    }

    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    

      constructor(tabBar: TabBar, element: ElementRef) {
        this._tabBar = tabBar;
        this._element = element;
        tabBar.add(this);
        this.index = tabBar.tabs.length - 1;      
      }

      select() {
        this._tabBar.selectTab(this);
      }

      setHeight(height: number){
        this.wrapper.nativeElement.style.height = height + "px";
      }

      setMargin(margin: number){
        this.wrapper.nativeElement.style.marginTop = margin + "px";
      }
}