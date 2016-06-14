import { Component, Input, ElementRef, OnInit, OnDestroy,
 AfterContentInit } from '@angular/core';
import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter';
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
    providers: [HammerGesturesManager],
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class Item implements AfterContentInit, OnInit, OnDestroy {
    private _dom;
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

    constructor(private _el: ElementRef, private _touchManager: HammerGesturesManager) {
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

    private getLeftPosition = () => {
        return parseInt(this._dom.getStyle(this._content, "left"), 10);
    }

    private cancelEvent = (ev: HammerInput) => {
        return !ev.target.classList.contains(this._innerStyle) ||
        ev.direction == Hammer.DIRECTION_RIGHT && this.getLeftPosition() > 0;        
    }

    private panstart = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        let left = this.getLeftPosition();

        if (left < 0) {
            this._offset = left;
        } else if (ev.direction == Hammer.DIRECTION_LEFT && left > 0) {
            this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }    
            
    }

    private pan = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        if (ev.direction == Hammer.DIRECTION_LEFT && this.getLeftPosition() > 0) {
            this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }

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

        if (this.getLeftPosition() > 0) {
            this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }         
    }

    ngOnInit() {
        this._dom = getDOM();
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
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class Header {
    private _innerStyle: string = "ig-header-inner";
}
