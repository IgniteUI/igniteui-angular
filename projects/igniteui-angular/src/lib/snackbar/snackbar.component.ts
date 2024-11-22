import { useAnimation } from '@angular/animations';
import { NgIf } from '@angular/common';
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
    PositionSettings, VerticalAlignment } from '../services/public_api';
import { IgxNotificationsDirective } from '../directives/notification/notifications.directive';
import { ToggleViewEventArgs } from '../directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../directives/button/button.directive';
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
 * ```html
 * <button type="button" igxButton (click)="snackbar.show()">Send message</button>
 * <div>
 *   <igx-snackbar #snackbar>
 *      Message sent
 *   </igx-snackbar>
 * </div>
 * ```
 */
@Component({
    selector: 'igx-snackbar',
    templateUrl: 'snackbar.component.html',
    imports: [NgIf, IgxButtonDirective]
})
export class IgxSnackbarComponent extends IgxNotificationsDirective
    implements OnInit {
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
     * ```html
     * <igx-snackbar [actionText] = "'Action Text'"></igx-snackbar>
     * ```
     */
    @Input() public actionText?: string;

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
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     * ```html
     * <igx-snackbar (animationStarted) = "animationStarted($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationStarted = new EventEmitter<ToggleViewEventArgs>();

    /**
     * An event that will be emitted when the snackbar animation ends.
     * Provides reference to the `ToggleViewEventArgs` interface as an argument.
     * ```html
     * <igx-snackbar (animationDone) = "animationDone($event)"></igx-snackbar>
     * ```
     */
    @Output() public animationDone = new EventEmitter<ToggleViewEventArgs>();

    /**
     * Get the position and animation settings used by the snackbar.
     * ```typescript
     * @ViewChild('snackbar', { static: true }) public snackbar: IgxSnackbarComponent;
     * let currentPosition: PositionSettings = this.snackbar.positionSettings
     * ```
     */
    @Input()
    public get positionSettings(): PositionSettings {
        return this._positionSettings;
    }

    /**
     * Set the position and animation settings used by the snackbar.
     * ```html
     * <igx-snackbar [positionSettings]="newPositionSettings"></igx-snackbar>
     * ```
     * ```typescript
     * import { slideInTop, slideOutBottom } from 'igniteui-angular';
     * ...
     * @ViewChild('snackbar', { static: true }) public snackbar: IgxSnackbarComponent;
     *  public newPositionSettings: PositionSettings = {
     *      openAnimation: useAnimation(slideInTop, { params: { duration: '1000ms', fromPosition: 'translateY(100%)'}}),
     *      closeAnimation: useAnimation(slideOutBottom, { params: { duration: '1000ms', fromPosition: 'translateY(0)'}}),
     *      horizontalDirection: HorizontalAlignment.Left,
     *      verticalDirection: VerticalAlignment.Middle,
     *      horizontalStartPoint: HorizontalAlignment.Left,
     *      verticalStartPoint: VerticalAlignment.Middle,
     *      minSize: { height: 100, width: 100 }
     *  };
     * this.snackbar.positionSettings = this.newPositionSettings;
     * ```
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
     * ```typescript
     * this.snackbar.open();
     * ```
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
     *
     * ```typescript
     * this.snackbar.toggle();
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
