import { Component, Renderer, Input, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
//import { getDOM } from '@angular/platform-browser/src/dom/dom_adapter';
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

export class Item implements OnDestroy {
    @ViewChild('wrapper') wrapper: ElementRef;

    //private _dom;
    private _element: ElementRef = null;
    private _href: string = null;
    //private _content: HTMLElement = null;
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

    constructor(private element: ElementRef, private _touchManager: HammerGesturesManager, renderer: Renderer) {
        this._element = element;
        this._addEventListeners(renderer);
    }

    //ngAfterContentInit(): any {
         //this._content = this._element.nativeElement.firstChild;
    //}

    private _addEventListeners(renderer: Renderer) {
        renderer.listen(this._element.nativeElement, 'panstart', (event) => { this.panStart(event); }
        renderer.listen(this._element.nativeElement, 'panmove', (event) => { this.panMove(event); }
        renderer.listen(this._element.nativeElement, 'panend', (event) => { this.panEnd(event); }

        //this._touchManager.addEventListener(this._element.nativeElement, "panstart", this.panstart);
        //this._touchManager.addEventListener(this._element.nativeElement, "panmove", this.pan);
        //this._touchManager.addEventListener(this._element.nativeElement, "panend", this.panEnd);
    }

    private getLeftPosition = () => {
        let lp = parseInt(this.wrapper.nativeElement.offsetLeft, 10); 
        //return parseInt(this._dom.getStyle(this._content, "left"), 10);
        return lp;
    }

    private cancelEvent = (ev: Object) => {
        return !ev.target.classList.contains(this._innerStyle) ||
        ev.direction == Hammer.DIRECTION_RIGHT && this.getLeftPosition() > 0;        
    }

    private panStart = (ev: Object) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        let left = this.getLeftPosition();

        if (left < 0) {
            this._offset = left;
        } else if (ev.direction == Hammer.DIRECTION_LEFT && left > 0) {
            this.wrapper.nativeElement.style.left = 0; 
            //this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }    
            
    }

    private panMove = (ev: Object) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        if (ev.direction == Hammer.DIRECTION_LEFT && this.getLeftPosition() > 0) {
            this.wrapper.nativeElement.style.left = 0;             
            //this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }

        //let width: number = parseInt(this._dom.getComputedStyle(this._content)["width"], 10),
        let width: number = parseInt(this.wrapper.nativeElement.offsetWidth, 10),
            newOffset: number = this._offset + ev.deltaX,
            borderWidth: number = width - this._panOffset,
            target: EventTarget = ev.srcEvent.target;

        if (newOffset < -borderWidth ||
            newOffset > borderWidth) {
            /*this._dom.setStyle(target, "left", newOffset > 0 ?
                borderWidth : -borderWidth + "px");*/

            return;
        }

        this.wrapper.nativeElement.style.left = newOffset + "px"; 
        //this._dom.setStyle(target, "left", newOffset + "px");
    }

    private panEnd = (ev: Object) => {
        if (this.getLeftPosition() > 0) {
            this.wrapper.nativeElement.style.left = 0; 
            //this._dom.setStyle(this._content, "left", "0px");
            this._offset = 0;
        }         
    }

    //ngOnInit() {
        //this._dom = getDOM();
        //this._addEventListeners();
    //}

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
