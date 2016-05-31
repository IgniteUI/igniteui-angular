import { Component, Input } from 'angular2/core';


declare var module: any;

@Component({
  selector: 'ig-tab-bar',
  moduleId: module.id, // commonJS standard
  templateUrl: 'tab-bar-content.html'
})

export class TabBar {
    private _itemStyle: string = "ig-tabBar-inner";
    tabs: Tab[] = [];    

    add(tab: Tab) {
        this.tabs.push(tab);
        this.tabs.forEach((tab) => { tab.columnCount = this.getColumns(); });
    }

    selectTab(tab: Tab) {
        this.tabs.forEach((tab) => { tab.isSelected = false; });
        tab.isSelected = true;
    }

    getColumns() {
        return this.tabs.length > 5 ? 5 : this.tabs.length ;
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
    private _itemStyle: string = "ig-tab-inner";    
    private _tabBar: TabBar = null;

    isSelected: boolean = false;
    // Indirectly defines the width of the tab
    columnCount: number = 0;

    @Input() label: string;

    @Input() icon: string;

      constructor(tabBar: TabBar) {
        this._tabBar = tabBar;
        tabBar.add(this);
      }

      select() {    
        this._tabBar.selectTab(this);
      }
}