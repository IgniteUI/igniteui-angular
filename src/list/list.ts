import { Component, Input, ElementRef, OnInit, OnDestroy, 
 AfterContentInit } from 'angular2/core';
import { BrowserDomAdapter } from 'angular2/platform/browser';
import { HammerGesturesManager } from '../core/core';

// The `<ig-list>` component is a list container for 1..n `<ig-item>` tags.
@Component({
    selector: 'ig-list',
    host: {
        'role': 'list'
    },
    styles: [`
        :host .ig-list-inner {
            width: 100px;
            background: lightgreen;
            overflow: hidden;
        }
    `],
    template: `
        <div class="ig-list-inner">
          <ng-content></ng-content>
        </div>
     `
})

export class List {
}

// The `<ig-item>` directive is a container intended for row items in 
// a `<ig-list>` container.
@Component({
    selector: 'ig-item',
    host: {
        'role': 'listitem'
    },
    providers: [BrowserDomAdapter, HammerGesturesManager],
    styles: [`
        :host .ig-item-inner {
            width: 100px;
            background: lightblue;
            position: relative;
        }

        :host-context a {
            -moz-border-radius: 5px;
            -webkit-border-radius: 5px;
            border-radius: 5px;
            display: inline-block;
            padding: 10px 25px 10px 10px;
            position: relative;
            text-decoration: none;
        }

        :host-context a:before, :host-context a:after {
            border-right: 2px solid;
            content: '';
            display: block;
            height: 8px;
            margin-top: -6px;
            position: absolute;
            -moz-transform: rotate(135deg);
            -o-transform: rotate(135deg);
            -webkit-transform: rotate(135deg);
            transform: rotate(135deg);
            right: 10px;
            top: 50%;
            width: 0;
        }

        :host-context a:after {
            margin-top: -1px;
            -moz-transform: rotate(45deg);
            -o-transform: rotate(45deg);
            -webkit-transform: rotate(45deg);
            transform: rotate(45deg);
        }

        :host-context a:hover, :host-context a:focus,
        :host-context :hover:before, :host-context a:hover:after,
        :host-context a:focus:before, :host-context a:focus:after {
            color: red;
        }
    `],
    template: `
    <div class="ig-item-inner">
      <ng-content></ng-content>
    </div>`
})

export class Item implements AfterContentInit, OnInit, OnDestroy {
    private _href: string = null;
    private _content: HTMLElement = null;
    private _offset: number = 0;
    private _panOffset: number = 40;
    private _panOptions: Array<Object> = null;

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
        this._content = this._dom.querySelector(this._el.nativeElement,
            ".ig-item-inner");

        console.log(this._panOptions);

        if (this._href) {
            this._createLink();
        }

        if (this._panOptions) {
            this._createOptions();
        }
    }

    private _createLink(): void {
        let text = this._dom.getText(this._content);
        let template: string = `<a href="${this._href}">${text}</a>`;

        this._dom.setInnerHTML(this._content, template);
    }

    private _createOptions(): void {
        let text: string = this._dom.getText(this._content);
        let button: {name: string, label: string, icon: string } = {
            name: "",
            label: "",
            icon: ""
        };

        let buttonTemplate: string = `
            <button class="ig-icon-button ig-${button.icon}" 
                    aria-label="${button.label}" 
                    (click)="removeItem(index)">
              <i ig-icon>${button.name}</i>
            </button>
        `;


        let template: string = `
            <button class="ig-icon-button ig-delete" aria-label="Delete" 
                    (click)="removeItem(index)">
              <i ig-icon>delete</i>
            </button>
            ${text}
            <button class="ig-icon-button ig-recycle" aria-label="Recycle" 
                    (click)="recycle(index)">
              <i ig-icon>recycle</i>
            </button>
            <button class="ig-icon-button ig-eat" aria-label="Eat" 
                   (click)="eat(index)">
              <i ig-icon>eat</i>
            </button>
        `;


        this._dom.setInnerHTML(this._content, template);
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
    styles: [`
        :host-context .ig-header-inner {
            background: gray;
        }
    `],
    template: `
    <div class="ig-header-inner">
      <ng-content></ng-content>
    </div>`
})

export class Header {

}