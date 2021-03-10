import { CommonModule } from '@angular/common';
import { DeprecateMethod, DeprecateProperty } from '../core/deprecateDecorators';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    NgModule,
    OnDestroy,
    OnInit,
    Optional,
    Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService, IToggleView } from '../core/navigation';
import { IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { IgxOverlayOutletDirective } from '../directives/toggle/toggle.directive';
import {
    OverlaySettings,
    IgxOverlayService,
    HorizontalAlignment,
    VerticalAlignment,
    GlobalPositionStrategy,
} from '../services/public_api';
import { mkenum } from '../core/utils';

let NEXT_ID = 0;

/**
 * Enumeration for toast position
 * Can be:
 * Bottom
 * Middle
 * Top
 */
export const IgxToastPosition = mkenum({
    Bottom: 'bottom',
    Middle: 'middle',
    Top: 'top'
});

export type IgxToastPosition = (typeof IgxToastPosition)[keyof typeof IgxToastPosition];

/**
 * **Ignite UI for Angular Toast** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)
 *
 * The Ignite UI Toast provides information and warning messages that are non-interactive and cannot
 * be dismissed by the user. Toasts can be displayed at the bottom, middle, or top of the page.
 *
 * Example:
 * ```html
 * <button (click)="toast.open()">Show notification</button>
 * <igx-toast #toast
 *           message="Notification displayed"
 *           displayTime="1000">
 * </igx-toast>
 * ```
 */
@Component({
    selector: 'igx-toast',
    templateUrl: 'toast.component.html',
})
export class IgxToastComponent extends IgxToggleDirective
    implements IToggleView, OnInit, OnDestroy {
    /**
     * @hidden
     */
    @HostBinding('class.igx-toast')
    public cssClass = 'igx-toast';

    /**
     * Sets/gets the `id` of the toast.
     * If not set, the `id` will have value `"igx-toast-0"`.
     * ```html
     * <igx-toast id = "my-first-toast"></igx-toast>
     * ```
     * ```typescript
     * let toastId = this.toast.id;
     * ```
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-toast-${NEXT_ID++}`;

    /**
     * Emits an event prior the toast is shown.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (showing)="handleShowing($event)"></igx-toast>
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateProperty(`'showing' property is deprecated. You can use 'onOpening' instead.`)
    @Output()
    public showing = new EventEmitter<IgxToastComponent>();

    /**
     * Emits an event when the toast is shown.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (shown)="handleShown($event)"></igx-toast>
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateProperty(`'shown' property is deprecated. You can use 'onOpened' instead.`)
    @Output()
    public shown = new EventEmitter<IgxToastComponent>();

    /**
     * Emits an event prior the toast is hidden.
     * Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (hiding)="handleHiding($event)"></igx-toast>
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateProperty(`'hiding' property is deprecated. You can use 'onClosing' instead.`)
    @Output()
    public hiding = new EventEmitter<IgxToastComponent>();

    /**
     *  Emits an event when the toast is hidden.
     *  Provides reference to the `IgxToastComponent` as event argument.
     * ```html
     * <igx-toast (hidden)="handleHidden($event)"></igx-toast>
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateProperty(`'hidden' property is deprecated. You can use 'onClosed' instead.`)
    @Output()
    public hidden = new EventEmitter<IgxToastComponent>();

    /**
     * Sets/gets the `role` attribute.
     * If not set, `role` will have value `"alert"`.
     * ```html
     * <igx-toast [role] = "'notify'"></igx-toast>
     * ```
     * ```typescript
     * let toastRole = this.toast.role;
     * ```
     *
     * @memberof IgxToastComponent
     */
    @HostBinding('attr.role')
    @Input()
    public role = 'alert';

    /**
     * Sets/gets the `aria-live` attribute.
     * If not set, `aria-live` will have value `"polite"`.
     * ```html
     * <igx-toast [ariaLive] = "'polite'"></igx-toast>
     * ```
     * ```typescript
     * let toastAriaLive = this.toast.ariaLive;
     * ```
     *
     * @memberof IgxToastComponent
     */
    @HostBinding('attr.aria-live')
    @Input()
    public ariaLive = 'polite';

    /**
     * Sets/gets whether the toast will be hidden after the `displayTime` is over.
     * Default value is `true`.
     * ```html
     * <igx-toast [autoHide] = "false"></igx-toast>
     * ```
     * ```typescript
     * let autoHide = this.toast.autoHide;
     * ```
     *
     * @memberof IgxToastComponent
     */
    @Input()
    public autoHide = true;

    /**
     * Sets/gets the duration of time span(in milliseconds) which the toast will be visible
     * after it is being shown.
     * Default value is `4000`.
     * ```html
     * <igx-toast [displayTime] = "2500"></igx-toast>
     * ```
     * ```typescript
     * let displayTime = this.toast.displayTime;
     * ```
     *
     * @memberof IgxToastComponent
     */
    @Input()
    public displayTime = 4000;

    /**
     * Gets/Sets the container used for the toast element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-toast [outlet]="outlet"></igx-toast>
     * //..
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Enables/Disables the visibility of the toast.
     * If not set, the `isVisible` attribute will have value `false`.
     * ```html
     * <igx-toast [isVisible]="true"></igx-toast>
     * ```
     * ```typescript
     * let isVisible = this.toast.isVisible;
     * ```
     *
     * Two-way data binding.
     * ```html
     * <igx-toast [(isVisible)]="model.isVisible"></igx-toast>
     * ```
     *
     * @memberof IgxToastComponent
     */
    @Input()
    public get isVisible() {
        return !this.collapsed;
    }

    public set isVisible(value) {
        if (value !== this.isVisible) {
            if (value) {
                requestAnimationFrame(() => {
                    this.open();
                });
            } else {
                this.close();
            }
        }
    }

    /**
     * @hidden
     */
    @Output()
    public isVisibleChange = new EventEmitter<boolean>();

    /**
     * @deprecated Place your message in the toast content instead.
     * Sets/gets the message that will be shown by the toast.
     * ```html
     * <igx-toast [message]="Notification"></igx-toast>
     * ```
     * ```typescript
     * let toastMessage = this.toast.message;
     * ```
     * @memberof IgxToastComponent
     */
    @DeprecateProperty(`'message' property is deprecated.
        You can use place the message in the toast content or pass it as parameter to the show method instead.`)
    @Input()
    public set message(value: string | OverlaySettings) {
        this.toastMessage = value;
    }

    public get message() {
        return this.toastMessage;
    }

    /**
     * Sets/gets the position of the toast.
     * If not set, the `position` attribute will have value `IgxToastPosition.Bottom`.
     * ```html
     * <igx-toast [position]="top"></igx-toast>
     * ```
     * ```typescript
     * let toastPosition = this.toast.position;
     * ```
     *
     * @memberof IgxToastComponent
     */
    @Input()
    public position: IgxToastPosition = 'bottom';

    /**
     * Gets the nativeElement of the toast.
     * ```typescript
     * let nativeElement = this.toast.element;
     * ```
     *
     * @memberof IgxToastComponent
     */
    public get element() {
        return this._element.nativeElement;
    }

    /**
     * @hidden
     * @internal
     */
    public toastMessage: string | OverlaySettings = '';

    /**
     * @hidden
     */
    private timeoutId: number;
    private d$ = new Subject<boolean>();

    constructor(
        private _element: ElementRef,
        cdr: ChangeDetectorRef,
        @Optional() navService: IgxNavigationService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService
    ) {
        super(_element, cdr, overlayService, navService);
    }

    /**
     * @deprecated
     * Shows the toast.
     * If `autoHide` is enabled, the toast will hide after `displayTime` is over.
     *
     * ```typescript
     * this.toast.show();
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateMethod(`'show' is deprecated. Use 'open' method instead.`)
    public show(message?: string): void {
        this.open(message);
    }

    /**
     * @deprecated
     * Hides the toast.
     *
     * ```typescript
     * this.toast.hide();
     * ```
     *
     * @memberof IgxToastComponent
     */
    @DeprecateMethod(`'hide' is deprecated. Use 'close' method instead.`)
    public hide(): void {
        this.close();
    }

    /**
     * Shows the toast.
     * If `autoHide` is enabled, the toast will hide after `displayTime` is over.
     *
     * ```typescript
     * this.toast.open();
     * ```
     */
    public open(message?: string | OverlaySettings) {
        clearInterval(this.timeoutId);

        const overlaySettings: OverlaySettings = {
            positionStrategy: new GlobalPositionStrategy({
                horizontalDirection: HorizontalAlignment.Center,
                verticalDirection:
                    this.position === 'bottom'
                        ? VerticalAlignment.Bottom
                        : this.position === 'middle'
                            ? VerticalAlignment.Middle
                            : VerticalAlignment.Top,
            }),
            closeOnEscape: false,
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.outlet,
        };

        if (message !== undefined) {
            this.toastMessage = message;
        }

        this.showing.emit(this);
        super.open(overlaySettings);

        if (this.autoHide) {
            this.timeoutId = window.setTimeout(() => {
                this.close();
            }, this.displayTime);
        }
    }

    /**
     * Hides the toast.
     *
     * ```typescript
     * this.toast.close();
     * ```
     */
    public close() {
        clearInterval(this.timeoutId);
        this.hiding.emit(this);
        super.close();
    }

    /**
     * Toggles the visible state of the toast.
     * ```typescript
     * this.toast.toggle();
     * ```
     *
     * @memberof IgxToastComponent
     */
    public toggle() {
        super.toggle();
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.onOpened.pipe(takeUntil(this.d$)).subscribe(() => {
            this.isVisibleChange.emit(true);
            this.shown.emit(this);
        });

        this.onClosed.pipe(takeUntil(this.d$)).subscribe(() => {
            this.isVisibleChange.emit(false);
            this.hidden.emit(this);
        });
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.d$.next(true);
        this.d$.complete();
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxToastComponent],
    exports: [IgxToastComponent],
    imports: [CommonModule],
})
export class IgxToastModule { }
