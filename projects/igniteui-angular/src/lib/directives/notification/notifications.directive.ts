import { Directive, ElementRef, HostBinding, Input, OnDestroy, booleanAttribute } from '@angular/core';
import { IToggleView } from '../../core/navigation';
import { IPositionStrategy, OverlaySettings } from '../../services/public_api';
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
    @Input({ transform: booleanAttribute })
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
    public outlet: IgxOverlayOutletDirective | ElementRef<HTMLElement>;

    /**
     * Enables/Disables the visibility of the element.
     * If not set, the `isVisible` attribute will have value `false`.
     */
    @Input({ transform: booleanAttribute })
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
    public textMessage = '';

    /**
     * @hidden
     */
    public timeoutId: number;

    /**
     * @hidden
     */
    protected strategy: IPositionStrategy;

    /**
     * @hidden
     */
    public override open() {
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
    public override close() {
        clearTimeout(this.timeoutId);
        super.close();
    }
}
