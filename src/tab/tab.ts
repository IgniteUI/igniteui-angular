import { Component, Input } from 'angular2/core';


declare var module: any;

@Component({
  selector: 'ig-tab-bar',
  moduleId: module.id, // commonJS standard
  templateUrl: 'tab-bar-content.html'
})

export class TabBar {
    private _itemStyle: string = "ig-tabbar-inner";
    tabs: Tab[] = [];    

    add(tab: Tab) {
        this.tabs.push(tab);
        this.tabs.forEach((tab) => { tab.columnCount = this.getColumns(); });
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
private isSelected: boolean = false;
private tabbar: TabBar = null;
private columnCount: number = 0;

  constructor(tabbar:TabBar) {
    this.tabbar = tabbar;
    tabbar.add(this);
  }

    select() {    
        this.tabbar.tabs.forEach((tab) => { tab.isSelected = false; });
        this.isSelected = true;
    }
}