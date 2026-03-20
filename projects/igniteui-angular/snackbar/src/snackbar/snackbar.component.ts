import { useAnimation } from '@angular/animations';
import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ContainerPositionStrategy, GlobalPositionStrategy, HorizontalAlignment,
    PositionSettings, VerticalAlignment } from 'igniteui-angular/core';
import { ToggleViewEventArgs, IgxButtonDirective, IgxNotificationsDirective } from 'igniteui-angular/directives';
import { fadeIn, fadeOut } from 'igniteui-angular/animations';

let NEXT_ID = 0;
/**
 * **Ignite UI for Angular Snackbar** -
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/snackbar.html)
 *
 * The Ignite UI Snack Bar provides feedback about an operation with a single-line message, which can
 * include a link to an action such as Undo.
 *
 * Example:
 */
@Component({
    selector: 'igx-snackbar',
    templateUrl: 'snackbar.component.html',
    imports: [IgxButtonDirective]
})
export class IgxSnackbarComponent extends IgxNotificationsDirective
    implements OnInit {
    /**
     * Sets/gets the `id` of the snackbar.
     * If not set, the `id` of the first snackbar component  will be `"igx-snackbar-0"`;
     *
     * @memberof IgxSnackbarComponent
     */
    @HostBinding('attr.id')
    @Input()
    public override id = `igx-snackbar-${NEXT_ID++}`;

    /**
     * The default css class applied to the component.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-snackbar')
    public cssClass = 'igx-snackbar';

    /**
     * Sets/gets the `actionText` attribute.
     */
    @Input() public actionText?: string;

    /**
     * An event that will be emitted when the action button is clicked.
     * Provides reference to the `IgxSnackbarComponent` as an argument.
     */
    @Output()
    public clicked = new EventEmitter<IgxSnackbarComponent>();

    /**
     * An event that will be emitted when the snackbar animation starts.
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     */
    @Output() public animationStarted = new EventEmitter<ToggleViewEventArgs>();

    /**
     * An event that will be emitted when the snackbar animation ends.
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     */
    @Output() public animationDone = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Get the position and animation settings used by the snackbar.
     */
    @Input()
    public get positionSettings(): PositionSettings {
        return this._positionSettings;
    }

    /**
     * Set the position and animation settings used by the snackbar.
     */
    public set positionSettings(settings: PositionSettings) {
        this._positionSettings = settings;
    }

    private _positionSettings: PositionSettings = {
        horizontalDirection: HorizontalAlignment.Center,
        verticalDirection: VerticalAlignment.Bottom,
        openAnimation: useAnimation(fadeIn, { params: { duration: '.35s', easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
            fromPosition: 'translateY(100%)', toPosition: 'translateY(0)'} }),
        closeAnimation: useAnimation(fadeOut, {  params: { duration: '.2s', easing: 'cubic-bezier(0.4, 0.0, 1, 1)',
            fromPosition: 'translateY(0)', toPosition: 'translateY(100%)'} }),
    };

    /**
     * Shows the snackbar and hides it after the `displayTime` is over if `autoHide` is set to `true`.
     */
    public override open(message?: string) {
        if (message !== undefined) {
            this.textMessage = message;
        }

        this.strategy = this.outlet ? new ContainerPositionStrategy(this.positionSettings)
            : new GlobalPositionStrategy(this.positionSettings);
        super.open();
    }

    /**
     * Opens or closes the snackbar, depending on its current state.
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
    public triggerAction(): void {
        this.clicked.emit(this);
    }

    /**
     * @hidden
     */
    public override ngOnInit() {
        this.opened.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const openedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.animationStarted.emit(openedEventArgs);
        });

        this.closed.pipe(takeUntil(this.destroy$)).subscribe(() => {
            const closedEventArgs: ToggleViewEventArgs = { owner: this, id: this._overlayId };
            this.animationDone.emit(closedEventArgs);
        });
    }
}
