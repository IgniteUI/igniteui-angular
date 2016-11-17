import {Component, Input, Inject, SimpleChange, ElementRef, EventEmitter, Output, Renderer, OnInit, OnDestroy, OnChanges, Optional, AfterContentInit, NgModule} from '@angular/core';
// import {AnimationBuilder} from 'angular2/src/animate/animation_builder'; TODO
import { BaseComponent } from '../core/base';
import { HammerGesturesManager } from "../core/touch";
import {NavigationService, ToggleView} from '../core/navigation';

// cover for transpiler error
// SystemJS will eventually wrap the export in the proper node.js style function on the client
declare var module: any;

/**
 * Navigation Drawer component supports collapsible side navigation container.
 * Usage:
 * ```
 * <ig-nav-drawer id="ID" (event output bindings) [input bindings]>
 *  <div class="ig-drawer-content">
 *   <!-- expanded template -->
 *  </div>
 * </ig-nav-drawer>
 * ```
 * Can also include an optional `<div class="ig-drawer-mini-content">`.
 * ID required to register with NavigationService allow directives to target the control.
 */
@Component({
    selector: 'ig-nav-drawer',
    /* Per https://github.com/angular/angular/issues/2383 BUT https://github.com/angular/angular/issues/6053, can't use relative URLs still with SystemJS
        TODO: try https://github.com/angular/angular/issues/2991 ??
    */
    moduleId: module.id, // commonJS standard
    templateUrl: 'navigation-drawer.component.html',
    providers: [HammerGesturesManager]
})
export class NavigationDrawer extends BaseComponent implements ToggleView, OnInit, AfterContentInit, OnDestroy, OnChanges  {
    private _hasMimiTempl: boolean = false;
    private _swipeAttached: boolean = false;
    private _widthCache: {width: number, miniWidth: number} = {width: null, miniWidth: null};
    private css: { [name: string]: string; } = {
        "drawer" : "ig-nav-drawer",
        "overlay" : "ig-nav-drawer-overlay",
        "mini" : "mini",
        "miniProjection" : ".ig-drawer-mini-content",
        "styleDummy" : "style-dummy"
    };
    private _resolveOpen: (value?: any | PromiseLike<any>) => void;
    private _resolveClose: (value?: any | PromiseLike<any>) => void;

    private _drawer : any;
    get drawer(): HTMLElement {
        if (!this._drawer) {
            this._drawer = this.getChild("." + this.css["drawer"]);
        }
        return this._drawer;
    }
    private _overlay: any;
    get overlay() {
        if (!this._overlay) {
            this._overlay = this.getChild("." + this.css["overlay"]);
        }
        return this._overlay;
    }

    private _styleDummy: any;
    get styleDummy() {
        if (!this._styleDummy) {
            this._styleDummy = this.getChild("." + this.css["styleDummy"]);
        }
        return this._styleDummy;
    }

    /** Pan animation properties */
    private _panning: boolean = false;
    private _panStartWidth: number;
    private _panLimit: number;
    private _previousDeltaX: number;

    /**
     * Property to decide whether to change width or translate the drawer from pan gesture.
     */
    public get hasAnimateWidth(): boolean {
        return this.pin || this._hasMimiTempl;
    }

    private _maxEdgeZone: number = 50;
    /**
     * Used for touch gestures (swipe and pan). Defaults to 50 (in px) and is extended to at least 110% of the mini template width if available.
     * @protected set method
     */
    public get maxEdgeZone() {
        return this._maxEdgeZone;
    }

    protected set_maxEdgeZone(value: number) {
        this._maxEdgeZone = value;
    }

    /**
     * Get the Drawer width for specific state. Will attempt to evaluate requested state and cache.
     */
    public get expectedWidth() {
        return this.getExpectedWidth(false);
    }

    /**
     * Get the Drawer mini width for specific state. Will attempt to evaluate requested state and cache.
     */
    public get expectedMiniWidth() {
        return this.getExpectedWidth(true);
    }

    public get touchManager() {
        return this._touchManager;
    }

    /**
     * Exposes optional navigation service
     */
    public get state(){
        return this._state;
    }

    /** ID of the component */
    @Input() public id: string;

    /**
     * Position of the Navigation Drawer. Can be "left"(default) or "right". Only has effect when not pinned.
     */
    @Input() public position: string = "left";

    /**
     * Enables the use of touch gestures to manipulate the drawer - such as swipe/pan from edge to open, swipe toggle and pan drag.
     */
    @Input() public enableGestures: boolean = true;

    /** State of the drawer. */
    @Input() public isOpen: boolean = false;

    /** Pinned state of the drawer. Currently only support  */
    @Input() public pin: boolean = false;

    /** Minimum device width required for automatic pin to be toggled. Deafult is 1024, can be set to falsy value to ignore. */
    @Input() public pinThreshold: number = 1024;

    /**
     * Width of the drawer in its open state. Defaults to 300px based on the `.ig-nav-drawer` style.
     * Can be used to override or dynamically modify the width.
     */
    @Input() public width: string;

    /**
     * Width of the drawer in its mini state. Defaults to 60px based on the `.ig-nav-drawer.mini` style.
     * Can be used to override or dynamically modify the width.
     */
    @Input() public miniWidth: string;

    /** Event fired as the Navigation Drawer is about to open. */
    @Output() opening = new EventEmitter();
    /** Event fired when the Navigation Drawer has opened. */
    @Output() opened = new EventEmitter();
    /** Event fired as the Navigation Drawer is about to close. */
    @Output() closing = new EventEmitter();
    /** Event fired when the Navigation Drawer has closed. */
    @Output() closed = new EventEmitter();

    constructor(
        @Inject(ElementRef) private elementRef: ElementRef,
        @Optional() private _state: NavigationService,
        // private animate: AnimationBuilder, TODO
        protected renderer:Renderer,
        private _touchManager: HammerGesturesManager)
    {
        super(renderer);
    }

    ngOnInit() {
        // DOM and @Input()-s initialized
        if (this._state) {
            this._state.add(this.id,this);
        }
    }

    ngAfterContentInit() {
        // wait for template and ng-content to be ready
        this._hasMimiTempl = this.getChild(this.css["miniProjection"]) !== null;
        this.updateEdgeZone();
        if (this.pinThreshold && this.getWindowWidth() > this.pinThreshold) {
            this.pin = true;
        }

        // need to set height without absolute positioning
        this.ensureDrawerHeight();
        this.ensureEvents();
        // TODO: apply platform-safe Ruler from http://plnkr.co/edit/81nWDyreYMzkunihfRgX?p=preview
        // (https://github.com/angular/angular/issues/6515), blocked by https://github.com/angular/angular/issues/6904
    }

    ngOnDestroy() {
        this._touchManager.destroy();
        if (this._state) {
            this._state.remove(this.id)
        }
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
        // simple settings can come from attribute set (rather than binding), make sure boolean props are converted
        if (changes['enableGestures'] && changes['enableGestures'].currentValue !== undefined) {
            this.enableGestures = !!(this.enableGestures && this.enableGestures.toString() === "true");
            this.ensureEvents();
        }
        if (changes['pin'] && changes['pin'].currentValue !== undefined) {
            this.pin = !!(this.pin && this.pin.toString() === "true");
            this.ensureDrawerHeight();
            if (this.pin) {
                this._touchManager.destroy();
            } else {
                this.ensureEvents();
            }
        }

        if (changes['width'] && this.isOpen) {
            this.setDrawerWidth(changes['width'].currentValue);
        }

        if (changes['miniWidth']) {
            if (!this.isOpen) {
                this.setDrawerWidth(changes['miniWidth'].currentValue);
            }
            this.updateEdgeZone();
        }
    }

    private getWindowWidth() {
        return (window.innerWidth > 0) ? window.innerWidth : screen.width;
    }

    /**
     * Sets the drawer width.
     * @param width Width to set, must be valid CSS size string.
     */
    private setDrawerWidth (width: string) {
        window.requestAnimationFrame(() => {
            if(this.drawer) {
                this.renderer.setElementStyle(this.drawer, "width", width);
            }
        });
    }

    protected ensureDrawerHeight () {
        if (this.pin) {
            // TODO: nested in content?
            // setElementStyle warning https://github.com/angular/angular/issues/6563
            this.renderer.setElementStyle(this.drawer, "height", window.innerHeight + "px");
        }
    }

    /**
     * Get the Drawer width for specific state. Will attempt to evaluate requested state and cache.
     * @param mini Request mini width instead
     */
    protected getExpectedWidth (mini?: boolean) : number {
        if (mini) {
            if (!this._hasMimiTempl) {
                return 0;
            }
            if (this.miniWidth) {
                return parseFloat(this.miniWidth);
            } else {
                // if (!this.isOpen) { // This WON'T work due to transition timings...
                //     return this.elementRef.nativeElement.children[1].offsetWidth;
                // } else {
                if (this._widthCache["miniWidth"] === null) {
                    // force class for width calc. TODO?
                    this.renderer.setElementClass(this.styleDummy, this.css["drawer"], true);
                    this.renderer.setElementClass(this.styleDummy, this.css["mini"], true);
                    this._widthCache["miniWidth"] = this.styleDummy.offsetWidth;
                    this.renderer.setElementClass(this.styleDummy, this.css["drawer"], false);
                    this.renderer.setElementClass(this.styleDummy, this.css["mini"], false);
                }
                return this._widthCache["miniWidth"];
            }
        } else {
            if (this.width) {
                return parseFloat(this.width);
            } else {
                if (this._widthCache["width"] === null) {
                    // force class for width calc. TODO?
                    this.renderer.setElementClass(this.styleDummy, this.css["drawer"], true);
                    this._widthCache["width"] = this.styleDummy.offsetWidth;
                    this.renderer.setElementClass(this.styleDummy, this.css["drawer"], false);
                }
                return this._widthCache["width"];
            }
        }
    }

    /**
     * Get current Drawer width.
     */
    private getDrawerWidth () : number {
            return this.drawer.offsetWidth;
    }

    private ensureEvents() {
        // set listeners for swipe/pan only if needed, but just once
        if (this.enableGestures && !this.pin && !this._swipeAttached) {
            // Built-in manager handler(L20887) causes endless loop and max stack exception. https://github.com/angular/angular/issues/6993
            // Use ours for now (until beta.10):
            //this.renderer.listen(document, "swipe", this.swipe);
            this._touchManager.addGlobalEventListener("document", "swipe", this.swipe);
            this._swipeAttached = true;

            //this.renderer.listen(document, "panstart", this.panstart);
            //this.renderer.listen(document, "pan", this.pan);
            this._touchManager.addGlobalEventListener("document", "panstart", this.panstart);
            this._touchManager.addGlobalEventListener("document", "panmove", this.pan);
            this._touchManager.addGlobalEventListener("document", "panend", this.panEnd);
        }
    }

    private updateEdgeZone() {
        var maxValue;

        if (this._hasMimiTempl) {
            maxValue = Math.max(this._maxEdgeZone, this.getExpectedWidth(true) * 1.1);
            this.set_maxEdgeZone(maxValue);
        }
    }

    private swipe = (evt: HammerInput) => { //use lambda to keep class scope (http://stackoverflow.com/questions/18423410/typescript-retain-scope-in-event-listener)
        // TODO: Could also force input type: http://stackoverflow.com/a/27108052
        if(!this.enableGestures || evt.pointerType !== "touch") {
            return;
        }

        // HammerJS swipe is horizontal-only by default, don't check deltaY
        var deltaX, startPosition;
        if (this.position === "right") {
            // when on the right use inverse of deltaX
            deltaX = -evt.deltaX;
            startPosition = this.getWindowWidth() - (evt.center.x + evt.distance);
        } else {
            deltaX = evt.deltaX;
            startPosition = evt.center.x - evt.distance;
        }
        //only accept closing swipe (ignoring minEdgeZone) when the drawer is expanded:
        if ((this.isOpen && deltaX < 0) ||
            // positive deltaX from the edge:
            (deltaX > 0 && startPosition < this.maxEdgeZone)) {
            this.toggle(true);
        }
    }

    private panstart = (evt: HammerInput) => { // TODO: test code
        if(!this.enableGestures || this.pin || evt.pointerType !== "touch") {
            return;
        }
        var startPosition = this.position === "right" ? this.getWindowWidth() - (evt.center.x + evt.distance) : evt.center.x - evt.distance;

        // cache width during animation, flag to allow further handling
        if(this.isOpen || (startPosition < this.maxEdgeZone)) {
            this._panning = true;
            this._panStartWidth =  this.getExpectedWidth(!this.isOpen);
            this._panLimit = this.getExpectedWidth(this.isOpen);

            this.renderer.setElementClass(this.overlay, "panning", true);
            this.renderer.setElementClass(this.drawer, "panning", true);
        }
    }

    private pan = (evt: HammerInput) => {
        // TODO: input.deltaX = prevDelta.x + (center.x - offset.x); get actual delta (not total session one) from event?
        // pan WILL also fire after a full swipe, only resize on flag
        if (!this._panning) {
            return;
        }
        var right: boolean = this.position === "right",
            // when on the right use inverse of deltaX
            deltaX = right ? -evt.deltaX : evt.deltaX,
            visibleWidth, newX,
            percent;

        visibleWidth = this._panStartWidth + deltaX;


        if(this.isOpen && deltaX < 0) {
            // when visibleWidth hits limit - stop animating
            if (visibleWidth <= this._panLimit)  return;

            if (this.hasAnimateWidth) {
                percent = (visibleWidth - this._panLimit) / (this._panStartWidth - this._panLimit);
                newX = visibleWidth;
            } else {
                percent = visibleWidth / this._panStartWidth;
                newX = evt.deltaX;
            }
            this.setXSize(newX, percent.toPrecision(2));

        } else if (!this.isOpen && deltaX > 0){
            // when visibleWidth hits limit - stop animating
            if (visibleWidth >= this._panLimit) return;

            if (this.hasAnimateWidth) {
                 percent = (visibleWidth - this._panStartWidth) / (this._panLimit - this._panStartWidth);
                 newX = visibleWidth;
            } else {
                percent = visibleWidth / this._panLimit;
                newX = (this._panLimit - visibleWidth) * (right ? 1 : -1);
            }
            this.setXSize(newX, percent.toPrecision(2));
        }
    }

    private panEnd = (evt: HammerInput) => {
        if(this._panning) {
            var deltaX = this.position === "right" ? -evt.deltaX : evt.deltaX,
                visibleWidth: number = this._panStartWidth + deltaX;
            this.resetPan();

            // check if pan brought the drawer to 50%
            if (this.isOpen && visibleWidth <= this._panStartWidth/2 ) {
                this.close(true);
            } else if (!this.isOpen && visibleWidth >= this._panLimit/2) {
                this.open(true);
            }
            this._panStartWidth = null;
        }
    }

    private resetPan() {
        this._panning = false;
        /* styles fail to apply when set on parent due to extra attributes, prob ng bug */
        this.renderer.setElementClass(this.overlay, "panning", false);
        this.renderer.setElementClass(this.drawer, "panning", false);
        this.setXSize(0, "");
    }

    /**
     * Sets the absolute position or width in case the drawer doesn't change position.
     * @param x the number pixels to translate on the X axis or the width to set. 0 width will clear the style instead.
     * @param opacity optional value to apply to the overlay
     */
    private setXSize (x: number, opacity?: string) {
        // Angular polyfills patches window.requestAnimationFrame, but switch to DomAdapter API (TODO)
        window.requestAnimationFrame(() => {
            if (this.hasAnimateWidth) {
                this.renderer.setElementStyle(this.drawer, "width", x ? Math.abs(x) + "px" : "");
            } else {
                this.renderer.setElementStyle(this.drawer, "transform", x ? "translate3d(" + x + "px,0,0)" : "");
                this.renderer.setElementStyle(this.drawer, "-webkit-transform",  x ? "translate3d(" +x + "px,0,0)" : "");
            }
            if (opacity !== undefined) {
                this.renderer.setElementStyle(this.overlay, "opacity", opacity);
            }
        });
    }

    /**
     * Toggle the open state of the Navigation Drawer.
     * @param fireEvents Optional flag determining whether events should be fired or not.
     * @return Promise that is resolved once the operation completes.
     */
    public toggle(fireEvents?: boolean): Promise<any> {
        if (this.isOpen) {
            return this.close(fireEvents);
        } else {
            return this.open(fireEvents);
        }
    }

    /**
     * Open the Navigation Drawer. Has no effect if already opened.
     * @param fireEvents Optional flag determining whether events should be fired or not.
     * @return Promise that is resolved once the operation completes.
     */
    public open(fireEvents?: boolean): Promise<any> {
        if (this._panning) {
            this.resetPan();
        }
        if (this.isOpen) {
            return Promise.resolve();
        }
        if (fireEvents) {
            this.opening.emit("opening");
        }
        this.isOpen = true;

       // TODO: Switch to animate API when available
        // var animationCss = this.animate.css();
        //     animationCss
        //         .setStyles({'width':'50px'}, {'width':'400px'})
        //         .start(this.elementRef.nativeElement)
        //         .onComplete(() => animationCss.setToStyles({'width':'auto'}).start(this.elementRef.nativeElement));

        this.elementRef.nativeElement.addEventListener("transitionend", this.toggleOpenedEvent, false);
        this.setDrawerWidth(this.width);

        return new Promise<any>( resolve => {
            this._resolveOpen = (value?: any) => {
                resolve(value);
                if (fireEvents) {
                    this.opened.emit("opened");
                }
            };
        } );
    }

    private toggleOpenedEvent = (evt?) => {
        this.elementRef.nativeElement.removeEventListener("transitionend", this.toggleOpenedEvent, false);
        this._resolveOpen("opened");
        delete this._resolveClose;
    }

    private toggleClosedEvent = (evt?) => {
        this.elementRef.nativeElement.removeEventListener("transitionend", this.toggleClosedEvent, false);
        this._resolveClose("closed");
        delete this._resolveClose;
    }


    /**
     * Close the Navigation Drawer. Has no effect if already closed.
     * @param fireEvents Optional flag determining whether events should be fired or not.
     * @return Promise that is resolved once the operation completes.
     */
    public close(fireEvents?: boolean): Promise<any> {
        if (this._panning) {
            this.resetPan();
        }
        if (!this.isOpen) {
            return Promise.resolve();
        }
        if (fireEvents) {
            this.closing.emit("closing");
        }

        this.isOpen = false;
        this.setDrawerWidth(this._hasMimiTempl ? this.miniWidth : "");
        this.elementRef.nativeElement.addEventListener("transitionend", this.toggleClosedEvent, false);

        return new Promise<any>( resolve => {
            this._resolveClose = (value?: any) => {
                resolve(value);
                if (fireEvents) {
                    this.closed.emit("closed");
                }
            };
        } );
    }
}


@NgModule({
    declarations: [NavigationDrawer],
    exports: [NavigationDrawer]
})
export class NavigationDrawerModule {
}
