import {  animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {Component, EventEmitter, Input, NgModule, NgZone, Output} from "@angular/core";
import { HammerGesturesManager } from "../core/touch";

/**
 * IgxSnackbar provides feedback about an operation by showing brief message at the bottom of the screen on mobile
 * and lower left on larger devices. IgxSnackbar will appear above all
 * other elements on screen and only one can be displayed at a time.
 * ```
 * <igx-snackbar (event output bindings) [input bindings]>
 * </igx-snackbar>
 * ```
 */
@Component({
    animations: [
        trigger("slideInOut", [
            state("in", style({
                color: "rgba(255,255,255,1)",
                transform: "translateY(0)"
            })),
            transition("void => *", [
                style({
                    transform: "translateY(100%)"
                }),
                animate(".35s cubic-bezier(0.0, 0.0, 0.2, 1)")
            ]),
            transition("* => void", [
                animate(".2s cubic-bezier(0.4, 0.0, 1, 1)", style({
                    transform: "translateY(100%)"
                }))
            ])
        ]),
        trigger("fadeInOut", [
            state("in", style({
                opacity: 1
            })),
            transition("void => *", [
                style({
                    opacity: 0
                }),
                animate(".35s ease-out")
            ]),
            transition("* => void", [
                animate(".2s ease-out", style({
                    opacity: 0
                }))
            ])
        ])
    ],
    moduleId: module.id,
    providers: [HammerGesturesManager],
    selector: "igx-snackbar",
    templateUrl: "snackbar.component.html"
})
export class IgxSnackbar {
    /**
     * The message that will be shown message by the IgxSnackbar component
     * @type {string}
     */
    @Input()
    public message: string;

    /**
     * The IgxSnackbar component visual state state
     * @type {boolean}
     */
    @Input()
    public isVisible: boolean = false;

    /**
     * Sets if the IgxSnackbar component will be hidden after shown
     * Default value is true
     * @type {number}
     */
    @Input()
    public autoHide: boolean = true;

    /**
     * The duration of time span in ms which the IgxSnackbar component will be visible
     * after it is being shown.
     * Default value is 4000
     * @type {number}
     */
    @Input()
    public displayTime: number = 4000;

    /**
     * The text of the IgxSnackbar component action
     * @type {string}
     */
    @Input()
    public actionText?: string;

    /**
     * The event that will be thrown when the action is executed,
     * provides reference to the IgxSnackbar component as argument
     * @type {EventEmitter}
     */
    @Output()

    /**
     * The event that will be thrown when the snackbar animation starts
     * @type {EventEmitter<AnimationTransitionEvent>}
     */
    @Output() public animationStarted = new EventEmitter<any>();

    /**
     * The event that will be thrown when the snackbar animation ends
     * @type {EventEmitter<AnimationTransitionEvent>}
     */
    @Output() public animationDone = new EventEmitter<any>();

    public onAction = new EventEmitter();

    private timeoutId;

    constructor(private zone: NgZone) {

    }

    /**
     * Shows the IgxSnackbar component and hides it after some time span
     * if autoHide is enabled
     */
    public show(): void {
        setTimeout(this.timeoutId);
        this.isVisible = true;

        if (this.autoHide) {
            this.timeoutId = setTimeout(() => {
                this.hide();
            }, this.displayTime);
        }
    }

    /**
     * Hides the IgxSnackbar component
     */
    public hide(): void {
        this.isVisible = false;
        clearTimeout(this.timeoutId);
    }

    private triggerAction(): void {
        this.onAction.emit(this);
    }

    private snackbarAnimationStarted(evt?: any): void {
        if (evt.fromState === "void") {
            this.animationStarted.emit(evt);
        }
    }

    private snackbarAnimationDone(evt?: any): void {
        if (evt.fromState === "show") {
            this.animationDone.emit(evt);
        }
    }
}

@NgModule({
    declarations: [IgxSnackbar],
    exports: [IgxSnackbar],
    imports: [CommonModule]
})
export class IgxSnackbarModule {
}
