import { Component, Input, ElementRef, OnInit, OnDestroy, AfterContentInit } from 'angular2/core';
import { BrowserDomAdapter } from 'angular2/platform/browser';

declare var module: any;

// The `<ig-tab>` directive is a container intended for tab items in
// a `<ig-tab>` container.
@Component({
    selector: 'ig-tab',
    host: {
        'role': 'tabitem'
    },
    providers: [BrowserDomAdapter],
    moduleId: module.id, // commonJS standard
    templateUrl: 'tab-content.html'
})

export class Tab implements AfterContentInit, OnInit, OnDestroy {
    private _content: HTMLElement = null;
    private _itemStyle: string = "ig-tab-inner";

    constructor(private _el: ElementRef, private _dom: BrowserDomAdapter) {
        //debugger;
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
}

// The `<ig-tab>` component is a tab container for 1..n `<ig-tab-bar>` elements.
@Component({
    selector: 'ig-tab-bar',
    host: {
        'role': 'tab'
    },
    moduleId: module.id, // commonJS standard
    providers: [BrowserDomAdapter],
    templateUrl: 'tab-bar-content.html',
    directives: [
        Tab
    ]
})

export class TabBar {
    private _itemStyle: string = "ig-tab-inner";
    private _tabItems: Array<Object> = null;

    @Input() set tabItems(tabItems: Array<Object>) {
        this._tabItems = tabItems;
    }

    constructor(private _el: ElementRef, private _dom: BrowserDomAdapter) {
        //debugger;
    }
}
