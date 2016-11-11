import { Component, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { HammerGesturesManager } from '../core/touch';
import { ButtonModule } from '../button/button';
import { CommonModule } from '@angular/common';

/**
 * IgxSnackbar provides feedback about an operation by showing brief message at the bottom of the screen on mobile
 * and lower left on larger devices. IgxSnackbar will appear above all
 * other elements on screen and only one can be displayed at a time.
 * ```
 * <ig-snackbar (event output bindings) [input bindings]>
 * </ig-snackbar>
 * ```
 **/
@Component({
    selector: 'ig-snackbar',
    moduleId: module.id,
    styleUrls: [
        'snackbar.component.scss'
    ],
    templateUrl: 'snackbar.component.html',
    providers: [HammerGesturesManager]
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
     * Default value is 10000
     * @type {number}
     */
    @Input()
    public displayTime: number = 10000;

    /**
     * The name of the IgxSnackbar component action
     * @type {string}
     */
    @Input()
    public actionName?: string;

    /**
     * The event that will thrown when the action is executed,
     * provides reference to the IgxSnackbar component as argument
     * @type {EventEmitter}
     */
    @Output()
    public onAction? = new EventEmitter();

    private _intevalId;

    /**
     * Shows the IgxSnackbar component and hides it after some time span
     * if autoHide is enabled
     */
    public show(): void {
        clearInterval(this._intevalId);
        this.isVisible = true;

        if(this.autoHide) {
            this._intevalId = setInterval(() => {
                this.hide();
            }, this.displayTime);
        }
    }

    /**
     * Hides the IgxSnackbar component
     */
    public hide(): void {
        this.isVisible = false;
        clearInterval(this._intevalId);
    }

    private _triggerAction(): void {
        this.onAction.emit(this);
    }
}

@NgModule({
    imports: [ButtonModule, CommonModule],
    declarations: [IgxSnackbar],
    exports: [IgxSnackbar]
})
export class IgxXSnackbarModule {
}
