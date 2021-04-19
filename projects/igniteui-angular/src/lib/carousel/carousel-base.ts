import { AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { fadeIn } from '../animations/fade';
import { slideInLeft } from '../animations/slide';
import { mkenum } from '../core/utils';

export enum Direction { NONE, NEXT, PREV }

export const CarouselAnimationType = mkenum({
    none: 'none',
    slide: 'slide',
    fade: 'fade'
});
export type CarouselAnimationType = (typeof CarouselAnimationType)[keyof typeof CarouselAnimationType];

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
    public animationType = CarouselAnimationType.slide;

    /** @hidden */
    protected currentItem: IgxSlideComponentBase;
    /** @hidden */
    protected previousItem: IgxSlideComponentBase;
    /** @hidden */
    protected enterAnimationPlayer?: AnimationPlayer;
    /** @hidden */
    protected leaveAnimationPlayer?: AnimationPlayer;
    /** @hidden */
    protected animationDuration = 320;
    /** @hidden */
    protected animationPosition = 0;
    /** @hidden */
    protected newDuration = 0;

    constructor(private builder: AnimationBuilder) {
    }

    /** @hidden */
    protected triggerAnimations() {
        if (this.animationType !== CarouselAnimationType.none) {
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
        }

        if (this.animationStarted(this.enterAnimationPlayer)) {
            this.enterAnimationPlayer.reset();
        }
    }

    private getAnimation(): CarouselAnimationSettings {
        let duration;
        if (this.newDuration) {
            duration = this.animationPosition ? this.animationPosition * this.newDuration : this.newDuration;
        } else {
            duration = this.animationPosition ? this.animationPosition * this.animationDuration : this.animationDuration;
        }

        switch (this.animationType) {
            case CarouselAnimationType.slide:
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
            case CarouselAnimationType.fade:
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
        const animationBuilder = this.builder.build(animation);

        this.enterAnimationPlayer = animationBuilder.create(this.getCurrentElement());

        this.enterAnimationPlayer.onDone(() => {
            if (this.enterAnimationPlayer) {
                this.enterAnimationPlayer.reset();
                this.enterAnimationPlayer = null;
            }
            this.animationPosition = 0;
            this.newDuration = 0;
            this.previousItem.previous = false;
        });
        this.previousItem.previous = true;
        this.enterAnimationPlayer.play();
    }

    private playLeaveAnimation() {
        const animation = this.getAnimation().leaveAnimation;
        if (!animation) {
            return;
        }

        const animationBuilder = this.builder.build(animation);
        this.leaveAnimationPlayer = animationBuilder.create(this.getPreviousElement());

        this.leaveAnimationPlayer.onDone(() => {
            if (this.leaveAnimationPlayer) {
                this.leaveAnimationPlayer.reset();
                this.leaveAnimationPlayer = null;
            }
            this.animationPosition = 0;
            this.newDuration = 0;
        });
        this.leaveAnimationPlayer.play();
    }

    protected abstract getPreviousElement(): HTMLElement;

    protected abstract getCurrentElement(): HTMLElement;
}
