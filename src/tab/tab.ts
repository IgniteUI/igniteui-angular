import { Component, Input, Output, ElementRef, ViewChild, AfterViewInit, AfterContentInit, EventEmitter } from '@angular/core';

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
    private get _visibleTabs() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this.tabs.filter(tab => tab.index < this._maxNumberTabsDisplayed - 1) : this.tabs;
    }

    private get _height() {
        return this._element.nativeElement.offsetHeight;
    }

    private get _columns() {
        return this.tabs.length > this._maxNumberTabsDisplayed ? this._maxNumberTabsDisplayed : this.tabs.length ;
    }

    private get tabListHeight() {
        if(this._tabList) {
            return this._tabList.nativeElement.offsetHeight;
        }
        
        return 0;
    }

    tabs: Tab[] = [];

    get selectedTab() {
        var selectedTabs = this.tabs.filter((tab) => tab.isSelected);

        if(selectedTabs.length == 0) {
            return undefined;
        } else {
            return selectedTabs[selectedTabs.length - 1];
        }
    }

    get selectedIndex() {
        if(this.selectedTab) {
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
            let tabListHeight = self.tabListHeight;
            tab.height = self._height - tabListHeight;
            if(self.alignment == "top") {
                tab.margin = tabListHeight;
            }
        });             
    }

    add(tab: Tab) {
        this.tabs.push(tab);
        this.tabs.forEach((tab) => { tab.columnCount = this._columns; });
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
        var tab, self = this;

        if(!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if(tab.isDisabled) {
            return;
        }

        this.tabs.forEach((tab) => { 
            if(tab.index != index) {
                self.deselect(tab.index); 
            }            
        });

        tab.isSelected = true;

        this.selectTab.emit({ index: index, tab: tab });
    }

    deselect(index: number) {
        var tab;

        if(!this._validateTabIndex(index)) {
            return;
        }

        tab = this.tabs[index];

        if(!tab.isDisabled && tab.isSelected) {
            tab.isSelected = false;
        }        
    }

    private _selectTabMore() {
        alert("Tab More is clicked");
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
    private _changesCount: number = 0; // changes and updates accordingly applied to the tab.

    isSelected: boolean = false;

    get index() {
        return this._tabBar.tabs.indexOf(this);
    }    

    get isDisabled() { 
        return this.disabled !== undefined;
    }

    set isDisabled(value: boolean) { 
        this.disabled = value;
    }

    get height() {
        return this.wrapper.nativeElement.style.height;
    }

    set height(value: number){
        this.wrapper.nativeElement.style.height = value + "px";
    }

    get margin(){
        return this.wrapper.nativeElement.style.marginTop;
    }

    set margin(value: number){
        this.wrapper.nativeElement.style.marginTop = value + "px";
    }

    // Indirectly defines the width of the tab.
    columnCount: number = 0;

    @Input() label: string;
    @Input() icon: string;
    @Input() disabled: boolean;
    @Input() href: string;   // TODO - need to be disccussed    

    constructor(private _tabBar: TabBar, private _element: ElementRef) {
        this._tabBar.add(this);
    }

    select() {
        if(this.href) {
                // TODO - href implementation. Priority over nested content
        } 

        this._tabBar.select(this.index);        
    }

    deselect() {
        this._tabBar.deselect(this.index);
    }
}