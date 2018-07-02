import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Inject
} from '@angular/core';
import { IgxNavigationService, IToggleView } from '../../core/navigation';
import { IgxOverlayService } from '../../services/overlay/overlay';
import { OverlaySettings, OverlayEventArgs, ConnectedPositioningStrategy, AbsoluteScrollStrategy } from '../../services';
import { filter, take } from 'rxjs/operators';
import { Subscription, OperatorFunction } from 'rxjs';

@Directive({
    exportAs: 'toggle',
    selector: '[igxToggle]'
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {
    private _overlayId: string;
    private _overlaySubFilter: OperatorFunction<OverlayEventArgs, OverlayEventArgs>[] = [
        filter(x => x.id === this._overlayId),
        take(1)
    ];
    private _overlayClosedSub: Subscription;
    private _overlayClosingSub: Subscription;

    @Output()
    public onOpened = new EventEmitter();

    @Output()
    public onOpening = new EventEmitter();

    @Output()
    public onClosed = new EventEmitter();

    @Output()
    public onClosing = new EventEmitter();

    private _collapsed = true;
    public get collapsed(): boolean {
        return this._collapsed;
    }

    @Input()
    public id: string;

    public get element() {
        return this.elementRef.nativeElement;
    }

    @HostBinding('class.igx-toggle--hidden')
    public get hiddenClass() {
        return this.collapsed;
    }

    @HostBinding('class.igx-toggle')
    public get defaultClass() {
        return !this.collapsed;
    }

    constructor(
        private elementRef: ElementRef,
        private cdr: ChangeDetectorRef,
        @Inject(IgxOverlayService) private overlayService: IgxOverlayService,
        @Optional() private navigationService: IgxNavigationService) {
    }

    public open(overlaySettings?: OverlaySettings) {
        if (!this.collapsed) { return; }

        this._collapsed = false;
        this.cdr.detectChanges();
        this.onOpening.emit();


        this._overlayId = this.overlayService.show(this.elementRef, overlaySettings);
        this.overlayService.onOpened.pipe(...this._overlaySubFilter).subscribe(() => {
            this.onOpened.emit();
        });
        this._overlayClosedSub = this.overlayService.onClosed
            .pipe(...this._overlaySubFilter)
            .subscribe(this.overlayClosed);
        this._overlayClosingSub = this.overlayService.onClosing
            .pipe(...this._overlaySubFilter)
            .subscribe(this.overlayClosing);
    }

    public close() {
        if (this.collapsed) { return; }

        this.overlayService.hide(this._overlayId);
    }

    public toggle(overlaySettings?: OverlaySettings) {
        this.collapsed ? this.open(overlaySettings) : this.close();
    }

    public ngOnInit() {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
        if (!this.collapsed && this._overlayId) {
            this.overlayService.hide(this._overlayId);
        }
        if (this._overlayClosedSub) {
            if (!this._overlayClosedSub.closed) {
                this._overlayClosedSub.unsubscribe();
            }
        }
        if (this._overlayClosingSub) {
            if (!this._overlayClosingSub.closed) {
                this._overlayClosingSub.unsubscribe();
            }
        }
    }

    private overlayClosed = () => {
        this._collapsed = true;
        this.onClosed.emit();
    }

    private overlayClosing = () => {
        this.onClosing.emit();
    }

}

@Directive({
    exportAs: 'toggle-action',
    selector: '[igxToggleAction]'
})
export class IgxToggleActionDirective implements OnInit {
    private _overlayDefaults: OverlaySettings;

    @Input()
    public overlaySettings: OverlaySettings;

    private _closeOnOutsideClick: boolean;
    public get closeOnOutsideClick(): boolean {
        return this._closeOnOutsideClick;
    }
    @Input()
    public set closeOnOutsideClick(v: boolean) {
        console.warn(`igxToggleAction 'closeOnOutsideClick' input is deprecated. Use 'overlaySettings' input object instead.`);
        this._closeOnOutsideClick = v;
    }

    @Input('igxToggleAction')
    set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    get target(): any {
        if (typeof this._target === 'string') {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    private _target: IToggleView | string;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    public ngOnInit() {
        this._overlayDefaults = {
            positionStrategy: new ConnectedPositioningStrategy({ target: this.element.nativeElement }),
            scrollStrategy: new AbsoluteScrollStrategy(),
            closeOnOutsideClick: true,
            modal: false
        };
    }

    @HostListener('click')
    public onClick() {
        if (this.closeOnOutsideClick !== undefined) {
            this._overlayDefaults.closeOnOutsideClick = this.closeOnOutsideClick;
        }
        this.target.toggle(Object.assign({}, this._overlayDefaults, this.overlaySettings));
    }
}
@NgModule({
    declarations: [IgxToggleDirective, IgxToggleActionDirective],
    exports: [IgxToggleDirective, IgxToggleActionDirective],
    providers: [IgxNavigationService]
})
export class IgxToggleModule { }
