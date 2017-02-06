import { Component, NgModule, Input, Output, EventEmitter } from '@angular/core';
import {  trigger, state, style, transition, animate, AnimationTransitionEvent } from '@angular/core';
import { HammerGesturesManager } from '../core/touch';
import { CommonModule } from '@angular/common';

/**
 * IgxSnackbar provides feedback about an operation by showing brief message at the bottom of the screen on mobile
 * and lower left on larger devices. IgxSnackbar will appear above all
 * other elements on screen and only one can be displayed at a time.
 * ```
 * <igx-snackbar (event output bindings) [input bindings]>
 * </igx-snackbar>
 * ```
 **/
@Component({
    selector: 'igx-snackbar',
    moduleId: module.id,
    templateUrl: 'snackbar.component.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translateY(0)',
                color: 'rgba(255,255,255,1)'
            })),
            transition('void => *', [
                style({
                    transform: 'translateY(100%)'
                }),
                animate('.35s cubic-bezier(0.0, 0.0, 0.2, 1)')
            ]),
            transition('* => void',[
                animate('.2s cubic-bezier(0.4, 0.0, 1, 1)', style({
                    transform: 'translateY(100%)'
                }))
            ])
        ]),
        trigger('fadeInOut', [
            state('in', style({
                opacity: 1
            })),
            transition('void => *', [
                style({
                    opacity: 0
                }),
                animate('.35s ease-out')
            ]),
            transition('* => void',[
                animate('.2s ease-out', style({
                    opacity: 0
                }))
            ])            
        ])
    ],
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
    public onAction = new EventEmitter();

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

    /**
     * The event that will be thrown when the snackbar animation starts
     * @type {EventEmitter<AnimationTransitionEvent>}
     */
    @Output() animationStarted = new EventEmitter<AnimationTransitionEvent>();
    private snackbarAnimationStarted(evt?: AnimationTransitionEvent): void {
        if(evt.fromState == 'void') {
            this.animationStarted.emit(evt);
        }
    };

    /**
     * The event that will be thrown when the snackbar animation ends
     * @type {EventEmitter<AnimationTransitionEvent>}
     */
    @Output() animationDone = new EventEmitter<AnimationTransitionEvent>();
    private snackbarAnimationDone(evt?: AnimationTransitionEvent): void {
        if(evt.fromState == 'show') {
            this.animationDone.emit(evt);
        }
    };
}

@NgModule({
    imports: [CommonModule],
    declarations: [IgxSnackbar],
    exports: [IgxSnackbar]
})
export class IgxSnackbarModule {
}
