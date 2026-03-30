import { AnimationReferenceMetadata } from '@angular/animations';
import { EventEmitter } from '@angular/core';
import { IBaseEventArgs } from '../../core/utils';

export interface AnimationService {
    /**
     * Creates an `AnimationPlayer` instance
     * @param animation A set of options describing the animation
     * @param element The DOM element on which animation will be applied
     * @returns AnimationPlayer
     */
     buildAnimation: (animationMetaData: AnimationReferenceMetadata, element: HTMLElement) => AnimationPlayer
}

export interface AnimationPlayer {
    /**
     * Emits when the animation starts
     */
    animationStart: EventEmitter<IBaseEventArgs>;
    /**
     * Emits when the animation ends
     */
    animationEnd: EventEmitter<IBaseEventArgs>;
    /**
     * Current position of the animation.
     */
    position: number;
    /**
     * Initialize the animation
    */
    init(): void;
    /**
     * Runs the animation
     */
    play(): void;
    /**
     * Ends the animation
     */
    finish(): void;
    /**
     * Resets the animation to its initial state
     */
    reset(): void;
    /**
     * Destroys the animation.
     */
    destroy(): void;
    /**
     * Reports whether the animation has started.
     */
    hasStarted(): boolean;
}
