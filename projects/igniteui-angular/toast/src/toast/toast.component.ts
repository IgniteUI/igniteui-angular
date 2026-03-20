import { Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import {
    HorizontalAlignment,
    VerticalAlignment,
    GlobalPositionStrategy,
    PositionSettings
} from 'igniteui-angular/core';
import { IgxNotificationsDirective } from 'igniteui-angular/directives';
import { ToggleViewEventArgs } from 'igniteui-angular/directives';
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
 */
@Component({
    selector: 'igx-toast',
    templateUrl: 'toast.component.html',
    standalone: true
})
export class IgxToastComponent extends IgxNotificationsDirective implements OnInit {
    private _element = inject(ElementRef);

    /**
     * @hidden
     */
    @HostBinding('class.igx-toast')
    public cssClass = 'igx-toast';

    /**
     * Sets/gets the `id` of the toast.
     * If not set, the `id` will have value `"igx-toast-0"`.
     */
    @HostBinding('attr.id')
    @Input()
    public override id = `igx-toast-${NEXT_ID++}`;

    /**
     * Sets/gets the `role` attribute.
     * If not set, `role` will have value `"alert"`.
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
     */
     @Input()
     public get positionSettings(): PositionSettings {
         return this._positionSettings;
     }

     /**
      * Set the position and animation settings used by the toast.
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
     *
     * @memberof IgxToastComponent
     */
    public override get element() {
        return this._element.nativeElement;
    }

    /**
     * Shows the toast.
     * If `autoHide` is enabled, the toast will hide after `displayTime` is over.
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
