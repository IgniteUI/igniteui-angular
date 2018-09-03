import { Directive, ElementRef, HostListener, Input, NgModule, ContentChild, TemplateRef, Renderer, Inject, ViewChild, ComponentFactoryResolver, ViewContainerRef, ComponentFactory, AfterContentInit, Renderer2, ComponentRef, ChangeDetectorRef, Injector, ApplicationRef, AfterViewInit, OnInit, forwardRef, Output, EventEmitter, Optional, HostBinding, Component } from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { ConnectedPositioningStrategy, OverlayEventArgs, OverlaySettings, AbsoluteScrollStrategy, VerticalAlignment, HorizontalAlignment, AutoPositionStrategy, Point } from '../../services';
import { CommonModule } from '@angular/common';
import { IgxNavigationService, IToggleView } from '../../core/navigation';
import { IgxOverlayOutletDirective, IgxToggleDirective, IgxToggleActionDirective } from '../toggle/toggle.directive';
import { fadeIn, fadeOut, slideInBottom, slideOutBottom } from '../../animations/main';

@Directive({
    exportAs: 'tooltip',
    selector: '[igxTooltip]'
})
export class IgxTooltipDirective extends IgxToggleActionDirective {

    /* Private Members */
    private _toBeShown: boolean = false;
    private _toBeHidden: boolean = false;
    private _timeoutId;
    private _tooltipClass: string = "igx-tooltip";

    /* Public Members */
    @Input('showDelay')
    public showDelay: number = 500;

    @Input('hideDelay')
    public hideDelay: number = 500;

    // 'this.target' - the tooltip element that can be shown/hidden
    @Input('igxTooltip')
    set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    get target(): any {
        if (typeof this._target === 'string') {
            return this._navigationService.get(this._target);
        }
        return this._target;
    }

    @Input('tooltipClass')
    get tooltipClass() {
        return this._tooltipClass;
    }

    set tooltipClass(value: string) {
        if (this._tooltipClass) {
            this._renderer.removeClass(this.target.element, this._tooltipClass);
        }

        this._tooltipClass = value;
        this._renderer.addClass(this.target.element, this._tooltipClass);
    }

    @Input('autoHide')
    public autoHide: boolean = true;

    @Input('autoHideDelay')
    public autoHideDelay: number = 5000;

    public get nativeElement() {
        return this._element.nativeElement;
    }

    constructor(private _element: ElementRef,
        private _renderer: Renderer2,
        private _cdr: ChangeDetectorRef,
        @Optional() private _navigationService: IgxNavigationService) {
        super(_element, _navigationService);
    }

    /* Private Methods */
    private checkOutletAndOutsideClick() {
        if (this.closeOnOutsideClick !== undefined) {
            this._overlayDefaults.closeOnOutsideClick = this.closeOnOutsideClick;
        }
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }
    }

    private get mergedOverlaySettings() {
        return Object.assign({}, this._overlayDefaults, this.overlaySettings);
    }

    private get targetPoint() {
        let result: Point = new Point(0, 0);
        const rect = (<HTMLElement>this.nativeElement).getBoundingClientRect();

        result.x = rect.right + rect.width * this.mergedOverlaySettings.positionStrategy.settings.horizontalStartPoint;
        result.y = rect.bottom + rect.height * this.mergedOverlaySettings.positionStrategy.settings.verticalStartPoint;

        return result;
    }

    private preMouseEnterCheck() {
        // If tooltip is about to be opened
        if (this._toBeShown) {
            clearTimeout(this._timeoutId);
            this._toBeShown = false;
        }

        // If Tooltip is opened or about to be hidden
        if (!this.target.collapsed || this._toBeHidden) {
            clearTimeout(this._timeoutId);
            this.target.close();
            this._toBeHidden = false;
        }
    }

    private preMouseLeaveCheck() {
        clearTimeout(this._timeoutId);

        // AUTO HIDE LOGIC
        if (this._toBeHidden) {
            clearTimeout(this._timeoutId);
            this._toBeHidden = false;
        }
        //

        // If tooltip is about to be opened
        if (this._toBeShown) {
            clearTimeout(this._timeoutId);
            this._toBeShown = false;
            this._toBeHidden = false;
            return;
        }
    }

    private attachDiv() {
        // const div = this._renderer.createElement('div');
        // const text = this._renderer.createText(this.target);
        // this._renderer.appendChild(div, text);
        // this._element.nativeElement.parentElement.insertBefore(this._element.nativeElement, div);

        // let el = $(`<div igxToggle>${this.target}</div>`).get(0);        
        // const test = el as any;


        const div = this._renderer.createElement('div');
        const text = this._renderer.createText(this.target);
        this._renderer.appendChild(div, text);
        this._renderer.setAttribute(div, "igxToggle", "mytoggle");
        div.open(this.mergedOverlaySettings);
    }

    /* Public Methods */
    @HostListener('click')
    public onClick() {
        return;
    }

    @HostListener('mouseenter')
    public onMouseEnter() {
        this.checkOutletAndOutsideClick();
        this.preMouseEnterCheck();

        this._toBeShown = true;
        this._timeoutId = setTimeout(() => {
            // this._overlayDefaults.positionStrategy.settings.target = this.targetPoint;
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxToggleDirective
            this._toBeShown = false;

            // AUTO HIDE LOGIC
            if (this.autoHide) {
                this._toBeHidden = true;
                this._timeoutId = setTimeout(() => {
                    this.target.close();
                    this._toBeHidden = false;
                }, this.autoHideDelay);
            }
            //

        }, this.showDelay);
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        this.checkOutletAndOutsideClick();
        this.preMouseLeaveCheck();

        this._toBeHidden = true;
        this._timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxToggleDirective
            this._toBeHidden = false;
        }, this.hideDelay);
    }

    public open() {
        clearTimeout(this._timeoutId);

        if (!this.target.collapsed) {
            this.target.close();
            this._toBeHidden = false;
        }

        this._toBeShown = true;
        this._timeoutId = setTimeout(() => {
            // this._overlayDefaults.positionStrategy.settings.target = this.targetPoint;
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxToggleDirective
            this._toBeShown = false;
        }, this.showDelay);
    }

    public close() {
        if (this.target.collapsed || this._toBeHidden) {
            return;
        }

        this._toBeHidden = true;
        this._timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxToggleDirective
            this._toBeHidden = false;
        }, this.hideDelay);
    }
}

@Directive({
    exportAs: 'tooltipEl',
    selector: '[IgxTooltipElement]'
})
export class IgxTooltipElementDirective extends IgxToggleDirective {
}

@NgModule({
    declarations: [IgxTooltipDirective, IgxTooltipElementDirective],
    exports: [IgxTooltipDirective, IgxTooltipElementDirective],
    imports: [CommonModule],
    providers: [IgxOverlayService]
})
export class IgxTooltipModule { }

