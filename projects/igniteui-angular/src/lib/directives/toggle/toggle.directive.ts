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
import { OverlaySettings } from '../../services';

@Directive({
    exportAs: 'toggle',
    selector: '[igxToggle]'
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {
    private _overlayId: string;

    @Output()
    public onOpened = new EventEmitter();

    @Output()
    public onOpening = new EventEmitter();

    @Output()
    public onClosed = new EventEmitter();

    @Output()
    public onClosing = new EventEmitter();

    @Input()
    public collapsed = true;

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
        this.overlayService.onClosed.subscribe(this.overlayClosed);
    }

    public open(fireEvents?: boolean, overlaySettings?: OverlaySettings) {
        if (!this.collapsed) { return; }

        if (fireEvents) {
            this.onOpening.emit();
        }

        this.collapsed = false;

        this._overlayId = this.overlayService.show(this.elementRef, overlaySettings);
        if (fireEvents) {
            this.onOpened.emit();
        }
    }

    public close(fireEvents?: boolean) {
        if (this.collapsed) { return; }

        if (fireEvents) {
            this.onClosing.emit();
        }

        if (this.id !== undefined) {
            this.overlayService.hide(this._overlayId);
        } else {
            this.collapsed = true;
        }

        if (fireEvents) {
            this.onClosed.emit();
        }
    }

    public toggle(fireEvents?: boolean, overlaySettings?: OverlaySettings) {
        this.collapsed ? this.open(fireEvents, overlaySettings) : this.close(fireEvents);
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
        if (!this.collapsed) {
            this.overlayService.hide(this.id);
        }
    }

    private overlayClosed = () => {
        this.collapsed = true;
    }
}

@Directive({
    exportAs: 'toggle-action',
    selector: '[igxToggleAction]'
})
export class IgxToggleActionDirective implements OnDestroy, OnInit {
    @Input()
    public closeOnOutsideClick = true;

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

    private _handler;
    private _target: IToggleView | string;

    constructor(private element: ElementRef, @Optional() private navigationService: IgxNavigationService) { }

    public ngOnDestroy() {
        document.removeEventListener('click', this._handler, true);
    }

    public ngOnInit() {
        if (this.closeOnOutsideClick) {
            this._handler = (evt) => {
                if (this.target.element.contains(evt.target) || this.element.nativeElement.contains(evt.target)) {
                    return;
                }

                this.target.close(true);
                document.removeEventListener('click', this._handler, true);
            };

            document.addEventListener('click', this._handler, true);
        }
    }

    @HostListener('click')
    public onClick() {
        this.target.toggle(true, {});

        if (this._handler) {
            document.addEventListener('click', this._handler, true);
        }
    }
}
@NgModule({
    declarations: [IgxToggleDirective, IgxToggleActionDirective],
    exports: [IgxToggleDirective, IgxToggleActionDirective],
    providers: [IgxNavigationService]
})
export class IgxToggleModule { }
