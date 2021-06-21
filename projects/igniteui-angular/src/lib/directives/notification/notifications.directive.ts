import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { IgxOverlayOutletDirective, IgxToggleDirective, IToggleView, OverlaySettings } from 'igniteui-angular';
import { Subject } from 'rxjs';

@Directive()
export abstract class IgxNotificationsDirective extends IgxToggleDirective
    implements IToggleView, OnInit, OnDestroy {
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
    @Input() public isVisible = false;

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
     * Hides the element.
     */
    public close() {
        this.isVisible = false;
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
