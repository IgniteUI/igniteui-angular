import {
    AnimationEvent,
    useAnimation
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    Output
} from '@angular/core';
import { slideInBottom, slideOutBottom } from '../animations/main';
import { DeprecateProperty } from '../core/deprecateDecorators';
import { IToggleView } from '../core/navigation';
import { IgxOverlayOutletDirective, IgxToggleDirective } from '../directives/toggle/toggle.directive';
import { GlobalPositionStrategy, HorizontalAlignment, OverlaySettings, VerticalAlignment } from '../services/public_api';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Snackbar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar.html)
 *
 * The Ignite UI Snack Bar provides feedback about an operation with a single-line message, which can
 * include a link to an action such as Undo.
 *
 * Example:
 * ```html
 * <button (click)="snackbar.show()">Send message</button>
 * <div>
 *   <igx-snackbar #snackbar message="Message sent">
 *   </igx-snackbar>
 * </div>
 * ```
 */
@Component({
    selector: 'igx-snackbar',
    templateUrl: 'snackbar.component.html',
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class IgxSnackbarComponent extends IgxToggleDirective
    implements IToggleView {

    /**
     * Sets/gets the `id` of the snackbar.
     * If not set, the `id` of the first snackbar component  will be `"igx-snackbar-0"`;
     * ```html
     * <igx-snackbar id = "Snackbar1"></igx-snackbar>
     * ```
     * ```typescript
     * let snackbarId = this.snackbar.id;
     * ```
     *
     * @memberof IgxSnackbarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-snackbar-${NEXT_ID++}`;

    /**
     * Sets/gets the `aria-live` attr of the snackbar message container.
     * If not set, the `aria-live` will be `polite`;
     * ```html
     * <igx-snackbar [ariaLive]="'polite'"></igx-snackbar>
     * ```
     * ```typescript
     * let snackbarAriaLive = this.snackbar.ariaLive;
     * ```
     *
     * @memberof IgxSnackbarComponent
     */
    @Input()
    @HostBinding('attr.aria-live')
    public ariaLive = 'polite';

    /**
     * Sets/gets the `message` attribute.
     * ```html
     * <igx-snackbar [message] = "'Snackbar Component'"></igx-snackbar>
     * ```
     * ```typescript
     * let message =  this.snackbar.message;
     * ```
     */
    @DeprecateProperty(`'message' property is deprecated.
    You can use place the message in the snackbar content or pass a message parameter to the show method instead.`)
    @Input()
    public set message(value: string | OverlaySettings) {
        this.snackbarMessage = value;
    }
    public get message() {
        return this.snackbarMessage;
    }

    /**
     * Enables/Disables the visibility of the snackbar.
     * If not set, the `isVisible` attribute will have value `false`.
     * ```html
     * <igx-snackbar [isVisible] = "true"></igx-snackbar>
     * ```
     * ```typescript
     * let isVisible =  this.snackbar.isVisible;
     * ```
     */
    @Input() public isVisible = false;

    /**
     * Sets/gets if the snackbar will be automatically hidden after the `displayTime` is over.
     * Default value is `true`.
     * ```html
     * <igx-snackbar [autoHide] = "false"></igx-snackbar>
     * ```
     * ```typescript
     * let autoHide =  this.snackbar.autoHide;
     * ```
     */
    @Input() public autoHide = true;

    /**
     * Sets/gets the duration of time(in milliseconds) in which the snackbar will be visible after it is being shown.
     * Default value is 4000.
     * ```html
     * <igx-snackbar [displayTime] = "2000"></igx-snackbar>
     * ```
     * ```typescript
     * let displayTime = this.snackbar.displayTime;
     * ```
     */
    @Input() public displayTime = 4000;

    /**
     * Sets/gets the `actionText` attribute.
     * ```html
     * <igx-snackbar [actionText] = "'Action Text'"></igx-snackbar>
     * ```
     */
    @Input() public actionText?: string;

    /**
     * Gets/Sets the container used for the snackbar element.
     *
     * @remarks
     *  `outlet` is an instance of `IgxOverlayOutletDirective` or an `ElementRef`.
     * @example
     * ```html
     * <div igxOverlayOutlet #outlet="overlay-outlet"></div>
     * //..
     * <igx-snackbar [outlet]="outlet"></igx-snackbar>
     * //..
     * ```
     */
    @Input()
    public outlet: IgxOverlayOutletDirective | ElementRef;

    /**
     * An event that will be emitted when the action button is clicked.
     * Provides reference to the `IgxSnackbarComponent` as an argument.
     * ```html
     * <igx-snackbar (clicked)="clickedHandler($event)"></igx-snackbar>
     * ```
     */
    @Output()
    public clicked = new EventEmitter<IgxSnackbarComponent>();

    /**
     * An event that will be emitted when the snackbar animation starts.
     * Provides reference to the `AnimationEvent` interface as an argument.
     * ```html
     * <igx-snackbar (animationStarted) = "animationStarted($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationStarted = new EventEmitter<AnimationEvent>();

    /**
     * An event that will be emitted when the snackbar animation ends.
     * Provides reference to the `AnimationEvent` interface as an argument.
     * ```html
     * <igx-snackbar (animationDone) = "animationDone($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationDone = new EventEmitter<AnimationEvent>();

    /**
     * @hidden
     * @internal
     */
    public snackbarMessage: string | OverlaySettings = '';

    /**
     * @hidden
     */
    private timeoutId;

    /**
     * Shows the snackbar and hides it after the `displayTime` is over if `autoHide` is set to `true`.
     * ```typescript
     * this.snackbar.open();
     * ```
     */
    public open(message?: string | OverlaySettings) {
        clearTimeout(this.timeoutId);

        const overlaySettings: OverlaySettings = {
            positionStrategy: new GlobalPositionStrategy({
                horizontalDirection: HorizontalAlignment.Center,
                verticalDirection: VerticalAlignment.Bottom,
                openAnimation: useAnimation(slideInBottom, {
                    params: {
                        duration: '.35s',
                        easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
                        fromPosition: 'translateY(100%)',
                        toPosition: 'translateY(0)'
                    }
                }),
                closeAnimation: useAnimation(slideOutBottom, {
                    params: {
                        duration: '.2s',
                        easing: 'cubic-bezier(0.4, 0.0, 1, 1)',
                        fromPosition: 'translateY(0)',
                        toOpacity: 1,
                        toPosition: 'translateY(100%)'
                    }
                })
            }),
            closeOnEscape: false,
            closeOnOutsideClick: false,
            modal: false,
            outlet: this.outlet,
        };

        if (message !== undefined) {
            this.snackbarMessage = message;
        }
        setTimeout(this.timeoutId);
        this.isVisible = true;
        super.open(overlaySettings);

        if (this.autoHide) {
            this.timeoutId = setTimeout(() => {
                this.close();
            }, this.displayTime);
        }
    }

    /**
     * Hides the snackbar.
     * ```typescript
     * this.snackbar.close();
     * ```
     */
    public close() {
        this.isVisible = false;
        clearTimeout(this.timeoutId);
        super.close();
    }

    /**
     * @hidden
     */
    public triggerAction(): void {
        this.clicked.emit(this);
    }

    /**
     * @hidden
     * @memberof IgxSnackbarComponent
     */
    public snackbarAnimationStarted(evt: AnimationEvent): void {
        if (evt.phaseName === 'start') {
            this.animationStarted.emit(evt);
        }
    }

    /**
     * @hidden
     * @memberof IgxSnackbarComponent
     */
    public snackbarAnimationDone(evt: AnimationEvent): void {
        if (evt.phaseName === 'done') {
            this.animationDone.emit(evt);
        }
    }
}

/**
 * @hidden
 */
@NgModule({
    declarations: [IgxSnackbarComponent],
    exports: [IgxSnackbarComponent],
    imports: [CommonModule]
})
export class IgxSnackbarModule { }
