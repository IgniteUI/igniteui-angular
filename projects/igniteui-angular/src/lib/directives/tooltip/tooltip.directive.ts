import {
    Directive, ElementRef, HostListener, Input, NgModule, Renderer2, ChangeDetectorRef, OnInit,
    Output, EventEmitter, Optional, HostBinding, OnDestroy
} from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { HorizontalAlignment, AutoPositionStrategy, PositionSettings } from '../../services';
import { CommonModule } from '@angular/common';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective, IgxToggleActionDirective } from '../toggle/toggle.directive';
import { Subscription } from 'rxjs';

export interface ITooltipOpeningEventArgs {
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}
export interface ITooltipOpenedEventArgs {
    tooltip: IgxTooltipDirective;
}
export interface ITooltipClosingEventArgs {
    tooltip: IgxTooltipDirective;
    cancel: boolean;
}
export interface ITooltipClosedEventArgs {
    tooltip: IgxTooltipDirective;
}

@Directive({
    exportAs: 'tooltipTarget',
    selector: '[igxTooltipTarget]'
})
export class IgxTooltipTargetDirective extends IgxToggleActionDirective implements OnInit, OnDestroy {

    /* Private Members */
    private _toBeShown = false;
    private _toBeHidden = false;
    private _timeoutId;
    private _tooltipOpenedSub: Subscription;
    private _tooltipClosedSub: Subscription;

    /* Public Members */
    @Input('showDelay')
    public showDelay = 500;

    @Input('hideDelay')
    public hideDelay = 500;

    @Input('tooltipDisabled')
    public tooltipDisabled = false;

    @Input('igxTooltipTarget')
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

    public get nativeElement() {
        return this._element.nativeElement;
    }

    public get tooltipHidden(): boolean {
        return !this.target || this.target.collapsed;
    }

    @Output()
    public onTooltipOpening = new EventEmitter<ITooltipOpeningEventArgs>();

    @Output()
    public onTooltipOpened = new EventEmitter<ITooltipOpenedEventArgs>();

    @Output()
    public onTooltipClosing = new EventEmitter<ITooltipClosingEventArgs>();

    @Output()
    public onTooltipClosed = new EventEmitter<ITooltipClosedEventArgs>();

    constructor(private _element: ElementRef,
        @Optional() private _navigationService: IgxNavigationService) {
        super(_element, _navigationService);
    }

    public ngOnInit() {
        super.ngOnInit();

        const positionSettings: PositionSettings = {
            target: this.nativeElement,
            horizontalDirection: HorizontalAlignment.Center,
            horizontalStartPoint: HorizontalAlignment.Center
        };

        this._overlayDefaults.positionStrategy = new AutoPositionStrategy(positionSettings);
        this._overlayDefaults.closeOnOutsideClick = false;

        const tooltipDir = (this.target as IgxTooltipDirective);
        this._tooltipOpenedSub = tooltipDir.onOpened.subscribe(() =>
            this.onTooltipOpened.emit({ tooltip: this.target })
        );
        this._tooltipClosedSub = tooltipDir.onClosed.subscribe(() =>
            this.onTooltipClosed.emit({ tooltip: this.target })
        );
    }

    public ngOnDestroy() {
        if (this._tooltipOpenedSub && !this._tooltipOpenedSub.closed) {
            this._tooltipOpenedSub.unsubscribe();
        }
        if (this._tooltipClosedSub && !this._tooltipClosedSub.closed) {
            this._tooltipClosedSub.unsubscribe();
        }
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

    // Return true if the execution in onMouseLeave should be terminated after this method
    private preMouseLeaveCheck(): boolean {
        clearTimeout(this._timeoutId);

        // If tooltip is about to be opened
        if (this._toBeShown) {
            clearTimeout(this._timeoutId);
            this._toBeShown = false;
            this._toBeHidden = false;
            return true;
        }

        return false;
    }

    /* Public Methods */
    @HostListener('document:keydown.escape', ['$event'])
    public onKeydownEscape(event: KeyboardEvent) {        
        const args = { tooltip: this.target, cancel: false };
        this.onTooltipClosing.emit(args);

        if (args.cancel) {
            return;
        }

        this._toBeHidden = true;
        this.target.close();
        this._toBeHidden = false;
    }

    @HostListener('click')
    public onClick() {
        return;
    }

    @HostListener('mouseenter')
    public onMouseEnter() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        this.preMouseEnterCheck();

        const args = { tooltip: this.target, cancel: false };
        this.onTooltipOpening.emit(args);

        if (args.cancel) {
            return;
        }

        this._toBeShown = true;
        this._timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this._toBeShown = false;
        }, this.showDelay);
    }

    @HostListener('mouseleave')
    public onMouseLeave() {
        if (this.tooltipDisabled) {
            return;
        }

        this.checkOutletAndOutsideClick();
        const shouldReturn = this.preMouseLeaveCheck();
        if (shouldReturn) {
            return;
        }

        const args = { tooltip: this.target, cancel: false };
        this.onTooltipClosing.emit(args);

        if (args.cancel) {
            return;
        }

        this._toBeHidden = true;
        this._timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this._toBeHidden = false;
        }, this.hideDelay);
    }

    public openTooltip() {
        clearTimeout(this._timeoutId);

        if (!this.target.collapsed) {
            this.target.close();
            this._toBeHidden = false;
        }

        const args = { tooltip: this.target, cancel: false };
        this.onTooltipOpening.emit(args);

        if (args.cancel) {
            return;
        }

        this._toBeShown = true;
        this._timeoutId = setTimeout(() => {
            this.target.open(this.mergedOverlaySettings); // Call open() of IgxTooltipDirective
            this._toBeShown = false;
        }, this.showDelay);
    }

    public closeTooltip() {
        if (this.target.collapsed && this._toBeShown) {
            clearTimeout(this._timeoutId);
        }

        if (this.target.collapsed || this._toBeHidden) {
            return;
        }

        const args = { tooltip: this.target, cancel: false };
        this.onTooltipClosing.emit(args);

        if (args.cancel) {
            return;
        }

        this._toBeHidden = true;
        this._timeoutId = setTimeout(() => {
            this.target.close(); // Call close() of IgxTooltipDirective
            this._toBeHidden = false;
        }, this.hideDelay);
    }
}

let NEXT_ID = 0;
@Directive({
    exportAs: 'tooltip',
    selector: '[igxTooltip]'
})
export class IgxTooltipDirective extends IgxToggleDirective {

    @HostBinding('class.igx-tooltip--hidden')
    public get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding('class.igx-tooltip')
    public get defaultClass() {
        return !this.collapsed;
    }

    @HostBinding('attr.id')
    @Input()
    public id = `igx-tooltip-${NEXT_ID++}`;

    @Input() public labelId = `${this.id}-label`;

    @HostBinding('attr.role')
    public get role() {
        return 'tooltip';
    }
}

@NgModule({
    declarations: [IgxTooltipDirective, IgxTooltipTargetDirective],
    exports: [IgxTooltipDirective, IgxTooltipTargetDirective],
    imports: [CommonModule],
    providers: [IgxOverlayService]
})
export class IgxTooltipModule { }

