import { Directive, ElementRef, HostListener, Input, NgModule, Renderer2, ChangeDetectorRef, OnInit,
         Output, EventEmitter, Optional, HostBinding, OnDestroy } from '@angular/core';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { HorizontalAlignment, AutoPositionStrategy, PositionSettings } from '../../services';
import { CommonModule } from '@angular/common';
import { IgxNavigationService } from '../../core/navigation';
import { IgxToggleDirective, IgxToggleActionDirective } from '../toggle/toggle.directive';
import { Subscription } from 'rxjs';

export interface ITooltipEventArgs {
    tooltip: IgxTooltipDirective;
}

@Directive({
    exportAs: 'tooltipAction',
    selector: '[igxTooltipAction]'
})
export class IgxTooltipActionDirective extends IgxToggleActionDirective implements OnInit, OnDestroy {

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

    @Input('igxTooltipAction')
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
    public onTooltipOpening = new EventEmitter<ITooltipEventArgs>();

    @Output()
    public onTooltipOpened = new EventEmitter<ITooltipEventArgs>();

    @Output()
    public onTooltipClosing = new EventEmitter<ITooltipEventArgs>();

    @Output()
    public onTooltipClosed = new EventEmitter<ITooltipEventArgs>();

    constructor(private _element: ElementRef,
        private _renderer: Renderer2,
        private _cdr: ChangeDetectorRef,
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

    private preMouseLeaveCheck() {
        clearTimeout(this._timeoutId);

        // If tooltip is about to be opened
        if (this._toBeShown) {
            clearTimeout(this._timeoutId);
            this._toBeShown = false;
            this._toBeHidden = false;
            return;
        }
    }

    /* Public Methods */
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

        this.onTooltipOpening.emit({ tooltip: this.target });
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
        this.preMouseLeaveCheck();

        this.onTooltipClosing.emit({ tooltip: this.target });
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

        this.onTooltipOpening.emit({ tooltip: this.target });
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

        this.onTooltipClosing.emit({ tooltip: this.target });
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

    @HostBinding('attr.aria-labelledby')
    @Input('aria-labelledby')
    public ariaLabelledBy = this.labelId;

    @HostBinding('attr.aria-label')
    @Input('aria-label')
    public ariaLabel: string | null = null;
}

@NgModule({
    declarations: [IgxTooltipDirective, IgxTooltipActionDirective],
    exports: [IgxTooltipDirective, IgxTooltipActionDirective],
    imports: [CommonModule],
    providers: [IgxOverlayService]
})
export class IgxTooltipModule { }

