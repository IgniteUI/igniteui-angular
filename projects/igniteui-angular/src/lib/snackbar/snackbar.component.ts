import {
    animate,
    AnimationEvent,
    state,
    style,
    transition,
    trigger,
    useAnimation
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    NgModule,
    NgZone,
    Output
} from '@angular/core';
import { fadeIn, fadeOut, slideInBottom, slideOutBottom } from '../animations/main';

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
    animations: [
        trigger('slideInOut', [
            transition('void => *', [
                useAnimation(slideInBottom, {
                    params: {
                        duration: '.35s',
                        easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
                        fromPosition: 'translateY(100%)',
                        toPosition: 'translateY(0)'
                    }
                })
            ]),
            transition('* => void', [
                useAnimation(slideOutBottom, {
                    params: {
                        duration: '.2s',
                        easing: 'cubic-bezier(0.4, 0.0, 1, 1)',
                        fromPosition: 'translateY(0)',
                        toOpacity: 1,
                        toPosition: 'translateY(100%)'
                    }
                })
            ])
        ]),
        trigger('fadeInOut', [
            transition('void => *', [
                useAnimation(fadeIn, {
                    params: {
                        duration: '.35s',
                        easing: 'ease-out'
                    }
                })
            ]),
            transition('* => void', [
                useAnimation(fadeOut, {
                    params: {
                        duration: '.2s',
                        easing: 'ease-out'
                    }
                })
            ])
        ])
    ],
    selector: 'igx-snackbar',
    templateUrl: 'snackbar.component.html'
})
export class IgxSnackbarComponent {

    /**
     * Sets/gets the `id` of the snackbar.
     * If not set, the `id` of the first snackbar component  will be `"igx-snackbar-0"`;
     * ```html
     * <igx-snackbar id = "Snackbar1"></igx-snackbar>
     * ```
     * ```typescript
     * let snackbarId = this.snackbar.id;
     * ```
     * @memberof IgxSnackbarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-snackbar-${NEXT_ID++}`;
    /**
     * Sets/gets the `message` attribute.
     * ```html
     * <igx-snackbar [message] = "'Snackbar Component'"></igx-snackbar>
     * ```
     * ```typescript
     * let message =  this.snackbar.message;
     * ```
     */
    @Input() public message: string;

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
     * An event that will be emitted when the action is executed.
     * Provides reference to the `IgxSnackbarComponent` as an argument.
     * ```html
     * <igx-snackbar (onAction) = "onAction($event)"></igx-snackbar>
     * ```
     */
    @Output() public onAction = new EventEmitter<IgxSnackbarComponent>();

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
     *@hidden
     */
    private timeoutId;

    constructor(private zone: NgZone) { }

    /**
     * Shows the snackbar and hides it after the `displayTime` is over if `autoHide` is set to `true`.
     * ```typescript
     * this.snackbar.show();
     * ```
     */
    public show(): void {
        clearTimeout(this.timeoutId);
        setTimeout(this.timeoutId);
        this.isVisible = true;

        if (this.autoHide) {
            this.timeoutId = setTimeout(() => {
                this.hide();
            }, this.displayTime);
        }
    }

    /**
     * Hides the snackbar.
     * ```typescript
     * this.snackbar.hide();
     * ```
     */
    public hide(): void {
        this.isVisible = false;
        clearTimeout(this.timeoutId);
    }
    /**
     *@hidden
     */
    public triggerAction(): void {
        this.onAction.emit(this);
    }
    /**
     *@hidden
     * @memberof IgxSnackbarComponent
     */
    public snackbarAnimationStarted(evt: AnimationEvent): void {
        if (evt.fromState === 'void') {
            this.animationStarted.emit(evt);
        }
    }
    /**
     *@hidden
     * @memberof IgxSnackbarComponent
     */
    public snackbarAnimationDone(evt: AnimationEvent): void {
        if (evt.fromState === 'show') {
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
