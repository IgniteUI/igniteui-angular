import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    NgModule,
    OnInit,
    Optional,
    Output,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService } from '../core/navigation';
import {
    IgxOverlayService,
    HorizontalAlignment,
    VerticalAlignment,
    GlobalPositionStrategy,
    OverlaySettings
} from '../services/public_api';
import { mkenum } from '../core/utils';
import { IgxNotificationsDirective } from '../directives/notification/notifications.directive';

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
    templateUrl: 'toast.component.html'
})
export class IgxToastComponent extends IgxNotificationsDirective
    implements OnInit {
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
     * @hidden
     */
    @Output()
    public isVisibleChange = new EventEmitter<boolean>();

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

    constructor(
        private _element: ElementRef,
        cdr: ChangeDetectorRef,
        @Optional() navService: IgxNavigationService,
        @Inject(IgxOverlayService) overlayService: IgxOverlayService
    ) {
        super(_element, cdr, overlayService, navService);
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
            this.textMessage = message;
        }

        super.open(overlaySettings);

        if (this.autoHide) {
            this.timeoutId = window.setTimeout(() => {
                this.close();
            }, this.displayTime);
        }
    }

    /**
     * @hidden
     */
    public ngOnInit() {
        this.onOpened.pipe(takeUntil(this.d$)).subscribe(() => {
            this.isVisibleChange.emit(true);
        });

        this.onClosed.pipe(takeUntil(this.d$)).subscribe(() => {
            this.isVisibleChange.emit(false);
        });
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
