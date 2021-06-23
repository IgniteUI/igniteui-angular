import { Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { IToggleView } from '../../core/navigation';
import { OverlaySettings } from '../../services/public_api';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../toggle/toggle.directive';

@Directive()
export abstract class IgxNotificationsDirective extends IgxToggleDirective
    implements IToggleView, OnDestroy {
    /**
     * Sets/gets the `aria-live` attribute.
     * If not set, `aria-live` will have value `"polite"`.
     */
    @HostBinding('attr.aria-live')
    @Input()
    public ariaLive = 'polite';

    /**
     * Sets/gets whether the element will be hidden after the `displayTime` is over.
     * Default value is `true`.
     */
    @Input()
    public autoHide = true;

    /**
     * Sets/gets the duration of time span (in milliseconds) which the element will be visible
     * after it is being shown.
     * Default value is `4000`.
     */
    @Input()
    public displayTime = 4000;

    /**
     * Gets/Sets the container used for the element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * Enables/Disables the visibility of the element.
     * If not set, the `isVisible` attribute will have value `false`.
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
     * @internal
     */
    public textMessage: string | OverlaySettings = '';

    /**
     * @hidden
     */
    public timeoutId;
    public d$ = new Subject<boolean>();

    /**
     * @hidden
     */
    protected strategy;

    /**
     * @hidden
     */
    public open() {
        clearInterval(this.timeoutId);

        const overlaySettings: OverlaySettings = {
            positionStrategy: this.strategy,
            closeOnEscape: false,
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.outlet
        };

        super.open(overlaySettings);

        if (this.autoHide) {
            this.timeoutId = window.setTimeout(() => {
                this.close();
            }, this.displayTime);
        }
    }

    /**
     * Hides the element.
     */
    public close() {
        clearTimeout(this.timeoutId);
        super.close();
    }

    /**
     * @hidden
     */
    public ngOnDestroy() {
        this.d$.next(true);
        this.d$.complete();
    }
}
