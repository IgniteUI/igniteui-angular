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
    private _initialLeft: number = null;
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
        var val = value + "";

        if(val.indexOf("px") == -1) {
            val += "px";
        }

        this.wrapper.nativeElement.style.left = val;
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
        return this.left > 0 || this._initialLeft == null;
    }

    private panStart = (ev: HammerInput) => {  
        this._initialLeft = this.left;
    }

    private panMove = (ev: HammerInput) => {
        var newLeft;
        
        if (this.cancelEvent(ev))
        { return;}

        newLeft = this._initialLeft + ev.deltaX;
        newLeft = newLeft > 0 ? 0 : newLeft < this.maxLeft ? this.maxLeft : newLeft;

        this.left = newLeft;        
    }

    private panEnd = (ev: HammerInput) => {
        if (this.left > 0) {
            this.rightMagneticGrip();           
        } else {
            this.magneticGrip();
        }

        this._initialLeft = null;
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
        this.left = this.maxLeft;
    }
}