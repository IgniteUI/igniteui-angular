import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { ChangeDetectorRef, EventEmitter, Inject } from '@angular/core';
import { fadeIn } from '../animations/fade';
import { slideInLeft } from '../animations/slide';
import { mkenum } from '../core/utils';
import { IgxAngularAnimationService } from '../services/animation/angular-animation-service';
import { AnimationPlayer, AnimationService } from '../services/animation/animation';

export enum Direction { NONE, NEXT, PREV }

export const HorizontalAnimationType = mkenum({
    none: 'none',
    slide: 'slide',
    fade: 'fade'
});
export type HorizontalAnimationType = (typeof HorizontalAnimationType)[keyof typeof HorizontalAnimationType];

export interface CarouselAnimationSettings {
    enterAnimation: AnimationReferenceMetadata;
    leaveAnimation: AnimationReferenceMetadata;
}

/** @hidden */
export interface IgxSlideComponentBase {
    direction: Direction;
    previous: boolean;
}

/** @hidden */
export abstract class IgxCarouselComponentBase {
    /** @hidden */
    public animationType: HorizontalAnimationType = HorizontalAnimationType.slide;

    /** @hidden @internal */
    public enterAnimationDone = new EventEmitter();
    /** @hidden @internal */
    public leaveAnimationDone = new EventEmitter();

    /** @hidden */
    protected currentItem: IgxSlideComponentBase;
    /** @hidden */
    protected previousItem: IgxSlideComponentBase;
    /** @hidden */
    protected enterAnimationPlayer?: AnimationPlayer;
    /** @hidden */
    protected leaveAnimationPlayer?: AnimationPlayer;
    /** @hidden */
    protected defaultAnimationDuration = 320;
    /** @hidden */
    protected animationPosition = 0;
    /** @hidden */
    protected newDuration = 0;

    constructor(
        @Inject(IgxAngularAnimationService)private animationService: AnimationService,
        private cdr: ChangeDetectorRef) {
    }

    /** @hidden */
    protected triggerAnimations() {
        if (this.animationType !== HorizontalAnimationType.none) {
            if (this.animationStarted(this.leaveAnimationPlayer) || this.animationStarted(this.enterAnimationPlayer)) {
                requestAnimationFrame(() => {
                    this.resetAnimations();
                    this.playAnimations();
                });
            } else {
                this.playAnimations();
            }
        }
    }

    /** @hidden */
    protected animationStarted(animation: AnimationPlayer): boolean {
        return animation && animation.hasStarted();
    }

    /** @hidden */
    protected playAnimations() {
        this.playLeaveAnimation();
        this.playEnterAnimation();
    }

    private resetAnimations() {
        if (this.animationStarted(this.leaveAnimationPlayer)) {
            this.leaveAnimationPlayer.reset();
            this.leaveAnimationDone.emit();
        }

        if (this.animationStarted(this.enterAnimationPlayer)) {
            this.enterAnimationPlayer.reset();
            this.enterAnimationDone.emit();
            this.cdr.markForCheck();
        }
    }

    private getAnimation(): CarouselAnimationSettings {
        let duration;
        if (this.newDuration) {
            duration = this.animationPosition ? this.animationPosition * this.newDuration : this.newDuration;
        } else {
            duration = this.animationPosition ? this.animationPosition * this.defaultAnimationDuration : this.defaultAnimationDuration;
        }

        switch (this.animationType) {
            case HorizontalAnimationType.slide:
                const trans = this.animationPosition ? this.animationPosition * 100 : 100;
                return {
                    enterAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(${this.currentItem.direction === 1 ? trans : -trans}%)`,
                                toPosition: 'translateX(0%)'
                            }
                        }),
                    leaveAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `translateX(0%)`,
                                toPosition: `translateX(${this.currentItem.direction === 1 ? -trans : trans}%)`,
                            }
                        })
                };
            case HorizontalAnimationType.fade:
                return {
                    enterAnimation: useAnimation(fadeIn,
                        { params: { duration: `${duration}ms`, startOpacity: `${this.animationPosition}` } }),
                    leaveAnimation: null
                };
        }
        return {
            enterAnimation: null,
            leaveAnimation: null
        };
    }

    private playEnterAnimation() {
        const animation = this.getAnimation().enterAnimation;
        if (!animation) {
            return;
        }

        this.enterAnimationPlayer = this.animationService.buildAnimation(animation, this.getCurrentElement());
        this.enterAnimationPlayer.animationEnd.subscribe(() => {
            if (this.enterAnimationPlayer) {
                this.enterAnimationPlayer.reset();
                this.enterAnimationPlayer = null;
            }
            this.animationPosition = 0;
            this.newDuration = 0;
            this.previousItem.previous = false;
            this.enterAnimationDone.emit();
            this.cdr.markForCheck();
        });
        this.previousItem.previous = true;
        this.enterAnimationPlayer.play();
    }

    private playLeaveAnimation() {
        const animation = this.getAnimation().leaveAnimation;
        if (!animation) {
            return;
        }

        this.leaveAnimationPlayer = this.animationService.buildAnimation(animation, this.getPreviousElement());
        this.leaveAnimationPlayer.animationEnd.subscribe(() => {
            if (this.leaveAnimationPlayer) {
                this.leaveAnimationPlayer.reset();
                this.leaveAnimationPlayer = null;
            }
            this.animationPosition = 0;
            this.newDuration = 0;
            this.leaveAnimationDone.emit();
        });
        this.leaveAnimationPlayer.play();
    }

    protected abstract getPreviousElement(): HTMLElement;

    protected abstract getCurrentElement(): HTMLElement;
}
