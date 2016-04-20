import { Component, Input, ElementRef, OnInit, OnDestroy,
 AfterContentInit } from 'angular2/core';
import { BrowserDomAdapter } from 'angular2/platform/browser';
import { HammerGesturesManager } from '../core/core';

declare var module: any;

// The `<ig-list>` component is a list container for 1..n `<ig-item>` tags.
@Component({
    selector: 'ig-list',
    host: {
        'role': 'list'
    },
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class List {
    private _innerStyle: string = "ig-list-inner";
}

// The `<ig-item>` directive is a container intended for row items in
// a `<ig-list>` container.
@Component({
    selector: 'ig-item',
    host: {
        'role': 'listitem'
    },
    providers: [BrowserDomAdapter, HammerGesturesManager],
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class Item implements AfterContentInit, OnInit, OnDestroy {
    private _href: string = null;
    private _content: HTMLElement = null;
    private _offset: number = 0;
    private _panOffset: number = 40;
    private _panOptions: Array<Object> = null;
    private _innerStyle: string = "ig-item-inner";

    @Input() set href(value: string) {
        this._href = value;
    }

    @Input() set options(options: Array<Object>) {
        this._panOptions = options;
    }

    get href(): string {
        return this._href;
    }

    constructor(private _el: ElementRef, private _dom: BrowserDomAdapter,
        private _touchManager: HammerGesturesManager) {
    }

    ngAfterContentInit(): any {
         this._content = this._el.nativeElement.firstChild;
    }

    private _addEventListeners() {
        this._touchManager.addEventListener(this._el.nativeElement, "panstart",
            this.panstart);
        this._touchManager.addEventListener(this._el.nativeElement, "panmove",
            this.pan);
        this._touchManager.addEventListener(this._el.nativeElement, "panend",
            this.panEnd);
    }

    private panstart = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        let offset = parseInt(this._dom.getStyle(this._content, "left"), 10);
        if (offset) {
            this._offset = offset;
        }
    }

    private pan = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        let width: number =
            parseInt(this._dom.getComputedStyle(this._content)["width"], 10);
        let newOffset: number = this._offset + ev.deltaX;
        let borderWidth: number = width - this._panOffset;
        let target: EventTarget = ev.srcEvent.target;

        if (newOffset < -borderWidth ||
            newOffset > borderWidth) {
            /*this._dom.setStyle(target, "left", newOffset > 0 ?
                borderWidth : -borderWidth + "px");*/

            return;
        }

        this._dom.setStyle(target, "left", newOffset + "px");
    }

    private panEnd = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }

        let offset = parseInt(this._dom.getStyle(this._content, "left"), 10);
        let width = parseInt(this._dom.getComputedStyle(this._content)["width"],
            10);
        let target: ElementRef = ev.srcEvent.target;
        let borderWidth = width - this._panOffset;

        if (borderWidth - offset < 10 || borderWidth - offset < -10) {
            this._dom.setStyle(target, "left", borderWidth + "px");
            console.log(borderWidth);
        }*/
    }

    ngOnInit() {
        this._addEventListeners();
    }

    ngOnDestroy() {
        this._touchManager.destroy();
    }
}

// The `<ig-header>` directive is a header intended for row items in
// a `<ig-list>` container.
@Component({
    selector: 'ig-header',
    host: {
        'role': 'listitemheader'
    },
    providers: [BrowserDomAdapter],
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class Header {
    private _innerStyle: string = "ig-header-inner";
}
