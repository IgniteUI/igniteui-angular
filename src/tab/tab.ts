import { Component, Input, ElementRef, OnInit, OnDestroy, AfterContentInit } from 'angular2/core';
import { BrowserDomAdapter } from 'angular2/platform/browser';

declare var module: any;

// The `<ig-tab>` directive is a container intended for tab items in
// a `<ig-tab>` container.
@Component({
    selector: 'ig-tab',
    host: {
        'role': 'tab'
    },
    providers: [BrowserDomAdapter],
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-content.html'
})

export class Tab implements AfterContentInit, OnInit, OnDestroy {
    private _content: HTMLElement = null;
    private _itemStyle: string = "ig-tab-inner";
    private _isSelected: boolean = false;
    private _element: ElementRef = null;

    tabbar: TabBar = null;

    constructor(private _el: ElementRef, private _dom: BrowserDomAdapter) {
        this._element = _el.nativeElement;
        this._element.classList.add("col-4");

        if(this._isSelected) {
            this._itemStyle += " selected";
        }
    }

    ngAfterContentInit(): any {
        this._content = this._el.nativeElement.firstChild;
    }

    private _addEventListeners() {
        //debugger;
    }

    ngOnInit() {
        this._addEventListeners();
    }
    ngOnDestroy() {
        //debugger;
    }

    tabClick() {
        var divInner;
        this._isSelected = true;
        this._element.classList.add("selected");
    }
}

// The `<ig-tab>` component is a tab container for 1..n `<ig-tab-bar>` elements.
@Component({
    selector: 'ig-tab-bar',
    host: {
        'role': 'tab-bar'
    },
    moduleId: module.id, // commonJS standard
    providers: [BrowserDomAdapter],
    templateUrl: 'tab-bar-content.html',
    directives: [
        Tab
    ]
})

export class TabBar {
    private _itemStyle: string = "ig-tabbar-inner";
    private _tabItems: Array<Object> = null;
    private _columnCount: number = 1;
    private _position: string = "Top";

    constructor(private _el: ElementRef, private _dom: BrowserDomAdapter) {
        _el.nativeElement.classList.add("tabbar-" + this._position.toLowerCase());
    }

    @Input() set tabItems(tabItems: Array<Object>) {
        this._tabItems = tabItems;
        this._columnCount = this.getColumnCount();
    }

    private getColumnCount() : number {
        var result = 1;

        if(this._tabItems && this._tabItems.length) {
            let len = this._tabItems.length;

            if(len > 5) {
                result = 5;
            } else {
                result = len;
            }
        }

        return result;
    }
}
