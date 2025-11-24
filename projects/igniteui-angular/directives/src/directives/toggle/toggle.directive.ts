import {
    ChangeDetectorRef,
    Directive,
    ElementRef,
    EventEmitter,
    HostListener,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { AbsoluteScrollStrategy } from 'igniteui-angular/core';
import { CancelableBrowserEventArgs, IBaseEventArgs, PlatformUtil } from 'igniteui-angular/core';
import { ConnectedPositioningStrategy } from 'igniteui-angular/core';
import { filter, first, takeUntil } from 'rxjs/operators';
import { IgxNavigationService, IToggleView } from 'igniteui-angular/core';
import { IgxOverlayService } from 'igniteui-angular/core';
import { IPositionStrategy } from 'igniteui-angular/core';
import { OffsetMode, OverlayClosingEventArgs, OverlayEventArgs, OverlaySettings } from 'igniteui-angular/core';
import { Subscription, Subject, MonoTypeOperatorFunction } from 'rxjs';

export interface ToggleViewEventArgs extends IBaseEventArgs {
    /** Id of the toggle view */
    id: string;
    /** Provides reference to the owner component (from IBaseEventArgs) */
    owner?: any;
    /* blazorSuppress */
    event?: Event;
}

export interface ToggleViewCancelableEventArgs extends ToggleViewEventArgs, CancelableBrowserEventArgs {
    cancel: boolean;
}

@Directive({
    exportAs: 'toggle',
    selector: '[igxToggle]',
    standalone: true,
    host: {
        '[class.igx-toggle--hidden]': 'hiddenClass',
        '[attr.aria-hidden]': 'hiddenClass',
        '[class.igx-toggle--hidden-webkit]': 'hiddenWebkitClass',
        '[class.igx-toggle]': 'defaultClass'
    }
})
export class IgxToggleDirective implements IToggleView, OnInit, OnDestroy {
    private elementRef = inject(ElementRef);
    private cdr = inject(ChangeDetectorRef);
    protected overlayService = inject<IgxOverlayService>(IgxOverlayService);
    private navigationService = inject(IgxNavigationService, { optional: true });
    private platform = inject(PlatformUtil, { optional: true });

    /**
     * Emits an event after the toggle container is opened.
     *
     * ```typescript
     * onToggleOpened(event) {
     *    alert("Toggle opened!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (opened)='onToggleOpened($event)'>
     * </div>
     * ```
     */
    @Output()
    public opened = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits an event before the toggle container is opened.
     *
     * ```typescript
     * onToggleOpening(event) {
     *  alert("Toggle opening!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (opening)='onToggleOpening($event)'>
     * </div>
     * ```
     */
    @Output()
    public opening = new EventEmitter<ToggleViewCancelableEventArgs>();

    /**
     * Emits an event after the toggle container is closed.
     *
     * ```typescript
     * onToggleClosed(event) {
     *  alert("Toggle closed!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (closed)='onToggleClosed($event)'>
     * </div>
     * ```
     */
    @Output()
    public closed = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Emits an event before the toggle container is closed.
     *
     * ```typescript
     * onToggleClosing(event) {
     *  alert("Toggle closing!");
     * }
     * ```
     *
     * ```html
     * <div
     *  igxToggle
     *  (closing)='onToggleClosing($event)'>
     * </div>
     * ```
     */
    @Output()
    public closing = new EventEmitter<ToggleViewCancelableEventArgs>();

    /**
     * Emits an event after the toggle element is appended to the overlay container.
     *
     * ```typescript
     * onAppended() {
     *  alert("Content appended!");
     * }
     * ```
     *
     * ```html
     * <div
     *   igxToggle
     *   (appended)='onToggleAppended()'>
     * </div>
     * ```
     */
    @Output()
    public appended = new EventEmitter<ToggleViewEventArgs>();

    /**
     * @hidden
     */
    public get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * Identifier which is registered into `IgxNavigationService`
     *
     * ```typescript
     * let myToggleId = this.toggle.id;
     * ```
     */
    @Input()
    public id: string;

    /**
     * @hidden
     */
    public get element(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    /**
     * @hidden
     */
    public get hiddenClass() {
        return this.collapsed;
    }

    /**
     * @hidden
     */
    public get hiddenWebkitClass() {
        const isSafari = this.platform?.isSafari;
        const browserVersion = this.platform?.browserVersion;

        return this.collapsed && isSafari && !!browserVersion && browserVersion < 17.5;
    }

    /**
     * @hidden
     */
    public get defaultClass() {
        return !this.collapsed;
    }

    protected _overlayId: string;

    private _collapsed = true;
    protected destroy$ = new Subject<boolean>();
    private _overlaySubFilter: [MonoTypeOperatorFunction<OverlayEventArgs>, MonoTypeOperatorFunction<OverlayEventArgs>] = [
        filter(x => x.id === this._overlayId),
        takeUntil(this.destroy$)
    ];
    private _overlayOpenedSub: Subscription;
    private _overlayClosingSub: Subscription;
    private _overlayClosedSub: Subscription;
    private _overlayContentAppendedSub: Subscription;

    /**
     * Opens the toggle.
     *
     * ```typescript
     * this.myToggle.open();
     * ```
     */
    public open(overlaySettings?: OverlaySettings) {
        //  if there is open animation do nothing
        //  if toggle is not collapsed and there is no close animation do nothing
        const info = this.overlayService.getOverlayById(this._overlayId);
        const openAnimationStarted = info?.openAnimationPlayer?.hasStarted() ?? false;
        const closeAnimationStarted = info?.closeAnimationPlayer?.hasStarted() ?? false;
        if (openAnimationStarted || !(this._collapsed || closeAnimationStarted)) {
            return;
        }

        this._collapsed = false;

        // TODO: this is a workaround for the issue introduced by Angular's with Ivy renderer.
        // When calling detectChanges(), Angular marks the element for check, but does not update the classes
        // immediately, which causes the overlay to calculate incorrect dimensions of target element.
        // Overlay show should be called in the next tick to ensure the classes are updated and target element is measured correctly.
        // Note: across the codebase, each host binding should be checked and similar fix applied if needed!!!
        this.elementRef.nativeElement.className = this.elementRef.nativeElement.className.replace('igx-toggle--hidden', 'igx-toggle');
        this.elementRef.nativeElement.className = this.elementRef.nativeElement.className.replace('igx-toggle--hidden-webkit', 'igx-toggle');
        this.elementRef.nativeElement.removeAttribute('aria-hidden');

        this.cdr.detectChanges();

        if (!info) {
            this.unsubscribe();
            this.subscribe();
            this._overlayId = this.overlayService.attach(this.elementRef, overlaySettings);
        }

        const args: ToggleViewCancelableEventArgs = { cancel: false, owner: this, id: this._overlayId };
        this.opening.emit(args);
        if (args.cancel) {
            this.unsubscribe();
            this.overlayService.detach(this._overlayId);
            this._collapsed = true;
            delete this._overlayId;
            this.cdr.detectChanges();
            return;
        }
        this.overlayService.show(this._overlayId, overlaySettings);
    }

    /**
     * Closes the toggle.
     *
     * ```typescript
     * this.myToggle.close();
     * ```
     */
    public close(event?: Event) {
        //  if toggle is collapsed do nothing
        //  if there is close animation do nothing, toggle will close anyway
        const info = this.overlayService.getOverlayById(this._overlayId);
        const closeAnimationStarted = info?.closeAnimationPlayer?.hasStarted() || false;
        if (this._collapsed || closeAnimationStarted) {
            return;
        }

        this.overlayService.hide(this._overlayId, event);
    }

    /**
     * Opens or closes the toggle, depending on its current state.
     *
     * ```typescript
     * this.myToggle.toggle();
     * ```
     */
    public toggle(overlaySettings?: OverlaySettings) {
        //  if toggle is collapsed call open
        //  if there is running close animation call open
        if (this.collapsed || this.isClosing) {
            this.open(overlaySettings);
        } else {
            this.close();
        }
    }

    /** @hidden @internal */
    public get isClosing() {
        const info = this.overlayService.getOverlayById(this._overlayId);
        return info ? info.closeAnimationPlayer?.hasStarted() : false;
    }

    /**
     * Returns the id of the overlay the content is rendered in.
     * ```typescript
     * this.myToggle.overlayId;
     * ```
     */
    public get overlayId() {
        return this._overlayId;
    }

    /**
     * Repositions the toggle.
     * ```typescript
     * this.myToggle.reposition();
     * ```
     */
    public reposition() {
        this.overlayService.reposition(this._overlayId);
    }

    /**
     * Offsets the content along the corresponding axis by the provided amount with optional
     * offsetMode that determines whether to add (by default) or set the offset values with OffsetMode.Add and OffsetMode.Set
     */
    public setOffset(deltaX: number, deltaY: number, offsetMode?: OffsetMode) {
        this.overlayService.setOffset(this._overlayId, deltaX, deltaY, offsetMode);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        if (this.navigationService && this.id) {
            this.navigationService.add(this.id, this);
        }
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        if (this.navigationService && this.id) {
            this.navigationService.remove(this.id);
        }
        if (this._overlayId) {
            this.overlayService.detach(this._overlayId);
        }
        this.unsubscribe();
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    private overlayClosed = (e) => {
        this._collapsed = true;
        this.cdr.detectChanges();
        this.unsubscribe();
        this.overlayService.detach(this.overlayId);
        const args: ToggleViewEventArgs = { owner: this, id: this._overlayId, event: e.event };
        delete this._overlayId;
        this.closed.emit(args);
        this.cdr.markForCheck();
    };

    private subscribe() {
        this._overlayContentAppendedSub = this.overlayService
            .contentAppended
            .pipe(first(), takeUntil(this.destroy$))
            .subscribe(() => {
                const args: ToggleViewEventArgs = { owner: this, id: this._overlayId };
                this.appended.emit(args);
            });

        this._overlayOpenedSub = this.overlayService
            .opened
            .pipe(...this._overlaySubFilter)
            .subscribe(() => {
                const args: ToggleViewEventArgs = { owner: this, id: this._overlayId };
                this.opened.emit(args);
            });

        this._overlayClosingSub = this.overlayService
            .closing
            .pipe(...this._overlaySubFilter)
            .subscribe((e: OverlayClosingEventArgs) => {
                const args: ToggleViewCancelableEventArgs = { cancel: false, event: e.event, owner: this, id: this._overlayId };
                this.closing.emit(args);
                e.cancel = args.cancel;

                //  in case event is not canceled this will close the toggle and we need to unsubscribe.
                //  Otherwise if for some reason, e.g. close on outside click, close() gets called before
                //  closed was fired we will end with calling closing more than once
                if (!e.cancel) {
                    this.clearSubscription(this._overlayClosingSub);
                }
            });

        this._overlayClosedSub = this.overlayService
            .closed
            .pipe(...this._overlaySubFilter)
            .subscribe(this.overlayClosed);
    }

    private unsubscribe() {
        this.clearSubscription(this._overlayOpenedSub);
        this.clearSubscription(this._overlayClosingSub);
        this.clearSubscription(this._overlayClosedSub);
        this.clearSubscription(this._overlayContentAppendedSub);
    }

    private clearSubscription(subscription: Subscription) {
        if (subscription && !subscription.closed) {
            subscription.unsubscribe();
        }
    }
}

@Directive({
    exportAs: 'toggle-action',
    selector: '[igxToggleAction]',
    standalone: true
})
export class IgxToggleActionDirective implements OnInit {
    protected element = inject(ElementRef);
    protected navigationService = inject(IgxNavigationService, { optional: true });

    /**
     * Provide settings that control the toggle overlay positioning, interaction and scroll behavior.
     * ```typescript
     * const settings: OverlaySettings = {
     *      closeOnOutsideClick: false,
     *      modal: false
     *  }
     * ```
     * ---
     * ```html
     * <!--set-->
     * <div igxToggleAction [overlaySettings]="settings"></div>
     * ```
     */
    @Input()
    public overlaySettings: OverlaySettings;

    /**
     * Determines where the toggle element overlay should be attached.
     *
     * ```html
     * <!--set-->
     * <div igxToggleAction [igxToggleOutlet]="outlet"></div>
     * ```
     * Where `outlet` in an instance of `IgxOverlayOutletDirective` or an `ElementRef`
     */
    @Input('igxToggleOutlet')
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * @hidden
     */
    @Input('igxToggleAction')
    public set target(target: any) {
        if (target !== null && target !== '') {
            this._target = target;
        }
    }

    /**
     * @hidden
     */
    public get target(): any {
        if (typeof this._target === 'string') {
            return this.navigationService.get(this._target);
        }
        return this._target;
    }

    protected _overlayDefaults: OverlaySettings;
    protected _target: IToggleView | string;

    /**
     * @hidden
     */
    @HostListener('click')
    public onClick() {
        if (this.outlet) {
            this._overlayDefaults.outlet = this.outlet;
        }

        const clonedSettings = Object.assign({}, this._overlayDefaults, this.overlaySettings);
        this.updateOverlaySettings(clonedSettings);
        this.target.toggle(clonedSettings);
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        const targetElement = this.element.nativeElement;
        this._overlayDefaults = {
            target: targetElement,
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new AbsoluteScrollStrategy(),
            closeOnOutsideClick: true,
            modal: false,
            excludeFromOutsideClick: [targetElement as HTMLElement]
        };
    }

    /**
     * Updates provided overlay settings
     *
     * @param settings settings to update
     * @returns returns updated copy of provided overlay settings
     */
    protected updateOverlaySettings(settings: OverlaySettings): OverlaySettings {
        if (settings && settings.positionStrategy) {
            const positionStrategyClone: IPositionStrategy = settings.positionStrategy.clone();
            settings.target = this.element.nativeElement;
            settings.positionStrategy = positionStrategyClone;
        }

        return settings;
    }
}

/**
 * Mark an element as an igxOverlay outlet container.
 * Directive instance is exported as `overlay-outlet` to be assigned to templates variables:
 * ```html
 * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
 * ```
 */
@Directive({
    exportAs: 'overlay-outlet',
    selector: '[igxOverlayOutlet]',
    standalone: true
})
export class IgxOverlayOutletDirective {
    public element = inject<ElementRef<HTMLElement>>(ElementRef);

    /** @hidden */
    public get nativeElement() {
        return this.element.nativeElement;
    }
}
