import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Inject,
    Input,
    OnInit,
    Optional,
    Output
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { IgxNavigationService } from '../core/navigation';
import {
    IgxOverlayService,
    HorizontalAlignment,
    VerticalAlignment,
    GlobalPositionStrategy,
    PositionSettings
} from '../services/public_api';
import { IgxNotificationsDirective } from '../directives/notification/notifications.directive';
import { ToggleViewEventArgs } from '../directives/toggle/toggle.directive';
import { useAnimation } from '@angular/animations';
import { fadeIn, fadeOut } from 'igniteui-angular/animations';

let NEXT_ID = 0;

/**
 * **Ignite UI for Angular Toast** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/toast)
 *
 * The Ignite UI Toast provides information and warning messages that are non-interactive and cannot
 * be dismissed by the user. Toasts can be displayed at the bottom, middle, or top of the page.
 *
 * Example:
 * ```html
 * <button type="button" igxButton (click)="toast.open()">Show notification</button>
 * <igx-toast #toast displayTime="1000">
 *      Notification displayed
 * </igx-toast>
 * ```
 */
@Component({
    selector: 'igx-toast',
    templateUrl: 'toast.component.html',
    standalone: true
})
export class IgxToastComponent extends IgxNotificationsDirective implements OnInit {
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
    public override id = `igx-toast-${NEXT_ID++}`;

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
    public isVisibleChange = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Get the position and animation settings used by the toast.
     * ```typescript
     * @ViewChild('toast', { static: true }) public toast: IgxToastComponent;
     * let currentPosition: PositionSettings = this.toast.positionSettings
     * ```
     */
     @Input()
     public get positionSettings(): PositionSettings {
         return this._positionSettings;
     }

     /**
      * Set the position and animation settings used by the toast.
      * ```html
      * <igx-toast [positionSettings]="newPositionSettings"></igx-toast>
      * ```
      * ```typescript
      * import { slideInTop, slideOutBottom } from 'igniteui-angular';
      * ...
      * @ViewChild('toast', { static: true }) public toast: IgxToastComponent;
      *  public newPositionSettings: PositionSettings = {
      *      openAnimation: useAnimation(slideInTop, { params: { duration: '1000ms', fromPosition: 'translateY(100%)'}}),
      *      closeAnimation: useAnimation(slideOutBottom, { params: { duration: '1000ms', fromPosition: 'translateY(0)'}}),
      *      horizontalDirection: HorizontalAlignment.Left,
      *      verticalDirection: VerticalAlignment.Middle,
      *      horizontalStartPoint: HorizontalAlignment.Left,
      *      verticalStartPoint: VerticalAlignment.Middle
      *  };
      * this.toast.positionSettings = this.newPositionSettings;
      * ```
      */
     public set positionSettings(settings: PositionSettings) {
         this._positionSettings = settings;
     }

     private _positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Bottom,
        openAnimation: useAnimation(fadeIn),
        closeAnimation: useAnimation(fadeOut),
     };

    /**
     * Gets the nativeElement of the toast.
     * ```typescript
     * let nativeElement = this.toast.element;
     * ```
     *
     * @memberof IgxToastComponent
     */
    public override get element() {
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
    public override open(message?: string, settings?: PositionSettings) {
        if (message !== undefined) {
            this.textMessage = message;
        }
        if (settings !== undefined) {
            this.positionSettings = settings;
        }
        this.strategy = new GlobalPositionStrategy(this.positionSettings);
        super.open();
    }

    /**
     * Opens or closes the toast, depending on its current state.
     *
     * ```typescript
     * this.toast.toggle();
     * ```
     */
     public override toggle() {
        if (this.collapsed || this.isClosing) {
            this.open();
        } else {
            this.close();
        }
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        this.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const openedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.isVisibleChange.emit(openedEventArgs);
        });

        this.closed.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const closedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.isVisibleChange.emit(closedEventArgs);
        });
    }
}
