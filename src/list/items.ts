import { Component, Directive, Renderer, Input, ElementRef, ViewChild, AfterViewInit, OnInit, ViewChildren, ViewContainerRef, Inject, forwardRef } from '@angular/core';
import { CommonModule } from "@angular/common";
import { HammerGesturesManager } from '../core/touch';
import { List } from './list';

//declare var module: any;

// ====================== HEADER ================================
// The `<ig-header>` directive is a header intended for row items in
// a `<ig-list>` container.
@Component({
    selector: 'ig-list-header',
    host: { 'role': 'listitemheader' },
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class ListHeader implements OnInit {
    private _innerStyle: string = "ig-header-inner";

    constructor(@Inject(forwardRef(() => List)) private list:List) {
    }

    public ngOnInit() {
        this.list.addHeader(this);
    }
}

// ====================== ITEM ================================
// The `<ig-item>` directive is a container intended for row items in
// a `<ig-list>` container.
@Component({
    selector: 'ig-list-item',
    host: { 'role': 'listitem' },
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class ListItem implements OnInit {
    @ViewChild('wrapper') wrapper: ElementRef;

    private _VISIBLE_AREA_ON_FULL_PAN = 40; // in pixels
    private _initialLeft: number = null;
    private _innerStyle: string = "ig-item-inner";

    hidden: boolean;

    get width() {
        if(this.element) {
            return this.element.nativeElement.offsetWidth;
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
        return -this.width + this._VISIBLE_AREA_ON_FULL_PAN;
    }

    @Input() href: string;
    @Input() options: Array<Object>
    @Input() filteringValue: string;

    constructor(@Inject(forwardRef(() => List)) private list:List, public element: ElementRef, private _renderer: Renderer) {
        this._addEventListeners();
    }

    public ngOnInit() {
        this.list.addItem(this);
    }

    private _addEventListeners() {
        this._renderer.listen(this.element.nativeElement, 'panstart', (event) => { this.panStart(event); });
        this._renderer.listen(this.element.nativeElement, 'panmove', (event) => { this.panMove(event); });
        this._renderer.listen(this.element.nativeElement, 'panend', (event) => { this.panEnd(event); });
    }

    private cancelEvent(ev: HammerInput) {
        return this.left > 0 || this._initialLeft == null;
    }

    private panStart(ev: HammerInput) {
        this._initialLeft = this.left;
    }

   private panMove(ev: HammerInput) {
        var newLeft;

        if (this.cancelEvent(ev))
        { return;}

        newLeft = this._initialLeft + ev.deltaX;
        newLeft = newLeft > 0 ? 0 : newLeft < this.maxLeft ? this.maxLeft : newLeft;

        this.left = newLeft;
    }

    private panEnd(ev: HammerInput) {
        if (this.left > 0) {
            this.rightMagneticGrip();
        } else {
            this.magneticGrip();
        }

        this._initialLeft = null;
    }

    private magneticGrip() {
        var left = this.left,
            halfWidth = this.width / 2;

        if(halfWidth && left < 0 && -left > halfWidth) {
            this.leftMagneticGrip();
        } else {
            this.rightMagneticGrip();
        }
    }

    private rightMagneticGrip() {
        this.left = 0;
    }

    private leftMagneticGrip() {
        this.left = this.maxLeft;
    }
}