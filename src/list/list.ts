import { Component, Renderer, Input, ElementRef, ViewChild } from '@angular/core';
import { HammerGesturesManager } from '../core/core';

declare var module: any;

// ====================== LIST ================================
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

// ====================== HEADER ================================
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

// ====================== ITEM ================================
// The `<ig-item>` directive is a container intended for row items in
// a `<ig-list>` container.
@Component({
    selector: 'ig-item',
    host: {
        'role': 'listitem'
    },
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class Item {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _VISIBLE_AREA_ON_FULL_PAN = 40; // in pixels
    //private _initialDirection: number;
    private _element: ElementRef = null;
    private _href: string = null;
    private _panOptions: Array<Object> = null;
    private _innerStyle: string = "ig-item-inner";

    get width() { 
        if(this._element) {
            return this._element.nativeElement.offsetWidth;
        } else {
            return 0;
        }        
    }

    get left() {
        return this.wrapper.nativeElement.offsetLeft;
    }
    set left(value: number) { 
        this.wrapper.nativeElement.style.left = value;
    }

    get maxLeft() {
        return - this.width + this._VISIBLE_AREA_ON_FULL_PAN;
    }

    @Input() set href(value: string) {
        this._href = value;
    }

    @Input() set options(options: Array<Object>) {
        this._panOptions = options;
    }

    get href(): string {
        return this._href;
    }

    constructor(private element: ElementRef, renderer: Renderer) {
        this._element = element;
        this._addEventListeners(renderer);
    }

    private _addEventListeners(renderer: Renderer) {
        renderer.listen(this._element.nativeElement, 'panstart', (event) => { this.panStart(event); });
        renderer.listen(this._element.nativeElement, 'panmove', (event) => { this.panMove(event); });
        renderer.listen(this._element.nativeElement, 'panend', (event) => { this.panEnd(event); });
    }

    private cancelEvent = (ev: HammerInput) => {
        return this.left > 0;
    }

    private panStart = (ev: HammerInput) => {  
        //this._initialDirection = ev.direction;
    }

    private panMove = (ev: HammerInput) => {
        if (this.cancelEvent(ev)) return;

        console.log(ev.offsetDirection + ", " + ev.direction + ", " + this.left + ", " + ev.deltaX);

        //if(ev.direction === ev.offsetDirection) { //this._initialDirection) {
            switch(ev.direction) {
            case Hammer.DIRECTION_LEFT:
                if(this.left > this.maxLeft) {
                    this.left = ev.deltaX + "px";
                }                
                break;
            case Hammer.DIRECTION_RIGHT:
                if(this.left < 0) {
                    this.left = this.maxLeft + ev.deltaX + "px";
                }                
                break;
            }    
       /* } else {
            switch(ev.direction) {
            case Hammer.DIRECTION_LEFT:
                if(this.left > this.maxLeft && ev.deltaX < 0) {
                    this.left = this.left - ev.deltaX + "px";
                }                
                break;
            case Hammer.DIRECTION_RIGHT:
                //if(this.left < 0) {
                    //this.left = this.maxLeft + ev.deltaX + "px";
                //}                
                break;
            }
        }  */         
    }

    private panEnd = (ev: HammerInput) => {
        if (this.left > 0) {
            this.rightMagneticGrip();           
        } else {
            this.magneticGrip();
        }

        //this._initialDirection = null;
    }

    private magneticGrip = () => {
        var left = this.left,
            halfWidth = this.width / 2;

        if(halfWidth && left < 0 && -left > halfWidth) {
            this.leftMagneticGrip();
        } else {
            this.rightMagneticGrip();
        }
    }

    private rightMagneticGrip = () => {
        this.left = 0;
    }

    private leftMagneticGrip = () => {
        this.left = this.maxLeft + "px";
    }
}