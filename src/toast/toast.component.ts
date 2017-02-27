import { Component, NgModule, Input, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { trigger, state, style, transition, animate, AnimationTransitionEvent } from '@angular/core';

/**
 * IgxToast provides information and warning messages. They could not be dismissed, are non-interactive and can appear
 * on top, middle and the bottom of the screen.
 * ```
 * <igx-toast (event output bindings) [input bindings]>
 * </igx-toast>
 * ```
 */
@Component({
    selector: "igx-toast",
    moduleId: module.id,
    templateUrl: "toast.component.html",
    animations: [
        trigger('animate', [
            state('show', style({
                opacity: 1
            })),
            transition('* => show', animate('.20s ease')),
            transition('show => *', animate('.40s ease-out'))
        ])
    ],
    host: {
        role: "alert"
    }
})
export class IgxToast {
    public readonly CSS_CLASSES = {
        IGX_TOAST_MIDDLE: "igx-toast--middle",
        IGX_TOAST_BOTTOM: "igx-toast--bottom",
        IGX_TOAST_TOP: "igx-toast--top"
    };

    /**
     * Event is thrown prior toast is shown
     * @type {EventEmitter}
     */
    @Output()
    public onShowing = new EventEmitter();

    /**
     * Event is shown when toast is shown
     * @type {EventEmitter}
     */
    @Output()
    public onShown = new EventEmitter();

    /**
     * Event is thrown prior toast hidden
     * @type {EventEmitter}
     */
    @Output()
    public onHiding = new EventEmitter();

    /**
     * Event is thrown when toast hidden
     * @type {EventEmitter}
     */
    @Output()
    public onHidden = new EventEmitter();


    /**
     * Sets if the IgxToast component will be hidden after shown
     * Default value is true
     * @type {number}
     */
    @Input()
    public autoHide: boolean = true;

    /**
     * The duration of time span in ms which the IgxToast component will be visible
     * after it is being shown.
     * Default value is 4000
     * @type {number}
     */
    @Input()
    public displayTime: number = 4000;

    /**
     * The IgxToast component visual state state
     * @type {boolean}
     */
    @Input()
    public isVisible: boolean = false;

    /**
     * The message that will be shown message by the IgxToast component
     * @type {string}
     */
    @Input()
    public message: string;

    /**
     * Specifies the position of the IgxToast component. Possible options are IgxToastPosition.Top,
     * IgxToastPosition.Middle, IgxToastPosition.Bottom
     * @type {IgxToastPosition}
     */
    @Input()
    public position: IgxToastPosition = IgxToastPosition.Bottom;

    private _intevalId;

    /**
     * Shows the IgxToast component and hides it after some time span
     * if autoHide is enabled
     */
    public show(): void {
        clearInterval(this._intevalId);
        this.onShowing.emit(this);
        this.isVisible = true;

        if (this.autoHide) {
            this._intevalId = setInterval(() => {
                this.hide();
            }, this.displayTime);
        }

        this.onShown.emit(this);
    }

    /**
     * Hides the IgxToast component
     */
    public hide(): void {
        this.onHiding.emit(this);
        this.isVisible = false;
        this.onHidden.emit(this);

        clearInterval(this._intevalId);
    }

    private _mapPositionToClassName(): any {
        if (this.position == IgxToastPosition.Top) {
            return this.CSS_CLASSES.IGX_TOAST_TOP;
        }

        if (this.position == IgxToastPosition.Middle) {
            return this.CSS_CLASSES.IGX_TOAST_MIDDLE;
        }

        if (this.position == IgxToastPosition.Bottom) {
            return this.CSS_CLASSES.IGX_TOAST_BOTTOM;
        }
    }
}

/**
 * Enumeration for toast position
 * Can be:
 * Bottom
 * Middle
 * Top
 */
export enum IgxToastPosition {
    Bottom,
    Middle,
    Top
}

@NgModule({
    imports: [CommonModule],
    declarations: [IgxToast],
    exports: [IgxToast]
})
export class IgxToastModule { }