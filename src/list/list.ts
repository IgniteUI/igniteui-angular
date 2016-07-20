/// <reference path="../../typings/globals/hammerjs/index.d.ts" />

import { Component, Renderer, Input, ElementRef, ViewChild } from '@angular/core';
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

    private _element: ElementRef = null;
    private _href: string = null;
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

    constructor(private element: ElementRef, renderer: Renderer) {
        this._element = element;
        this._addEventListeners(renderer);
    }

    private _addEventListeners(renderer: Renderer) {
        renderer.listen(this._element.nativeElement, 'panstart', (event) => { this.panStart(event); });
        renderer.listen(this._element.nativeElement, 'panmove', (event) => { this.panMove(event); });
        renderer.listen(this._element.nativeElement, 'panend', (event) => { this.panEnd(event); });
    }

    private getLeftPosition = () => {
        let lp = parseInt(this.wrapper.nativeElement.offsetLeft, 10);

        return lp;
    }

    private cancelEvent = (ev: HammerInput) => {
        return !ev.target.classList.contains(this._innerStyle) ||
        ev.direction == Hammer.DIRECTION_RIGHT && this.getLeftPosition() > 0;
    }

    private panStart = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        let left = this.getLeftPosition();

        if (left < 0) {
            this._offset = left;
        } else if (ev.direction == Hammer.DIRECTION_LEFT && left > 0) {
            this.wrapper.nativeElement.style.left = 0;
            this._offset = 0;
        }

    }

    private panMove = (ev: HammerInput) => {
        /*if (!ev.additionalEvent) {
            return;
        }*/

        if (this.cancelEvent(ev)) return;

        console.log(this.getLeftPosition());

        if (ev.direction == Hammer.DIRECTION_LEFT && this.getLeftPosition() > 0) {
            this.wrapper.nativeElement.style.left = 0;
            this._offset = 0;
        }

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
    }

    private panEnd = (ev: HammerInput) => {
        if (this.getLeftPosition() > 0) {
            this.wrapper.nativeElement.style.left = 0;
            this._offset = 0;
        }
    }
}