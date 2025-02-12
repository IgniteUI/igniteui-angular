import { AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { ChangeDetectorRef, EventEmitter, Inject, InjectionToken } from '@angular/core';
import { IgxAngularAnimationService } from '../services/animation/angular-animation-service';
import { AnimationPlayer, AnimationService } from '../services/animation/animation';
import { fadeIn, slideInLeft } from 'igniteui-angular/animations';
import { CarouselAnimationType, CarouselIndicatorsOrientation } from './enums';

export enum Direction { NONE, NEXT, PREV }

export interface CarouselAnimationSettings {
    enterAnimation: AnimationReferenceMetadata;
    leaveAnimation: AnimationReferenceMetadata;
}

export interface ICarouselComponentBase {
    id: string;
    role: string;
    cssClass: string;
    loop: boolean;
    pause: boolean;
    navigation: boolean;
    indicators: boolean;
    vertical: boolean;
    keyboardSupport: boolean;
    gesturesSupport: boolean;
    maximumIndicatorsCount: number;
    indicatorsOrientation: CarouselIndicatorsOrientation;
    animationType: CarouselAnimationType;
    total: number;
    current: number;
    interval: number;
    slideChanged: EventEmitter<any>;
    slideAdded: EventEmitter<any>;
    slideRemoved: EventEmitter<any>;
    carouselPaused: EventEmitter<any>;
    carouselPlaying: EventEmitter<any>;
    next(): void;
    prev(): void;
    play(): void;
    stop(): void
}

/** @hidden */
export const IGX_CAROUSEL_COMPONENT = /*@__PURE__*/new InjectionToken<ICarouselComponentBase>('IgxCarouselToken');

/** @hidden */
export interface IgxSlideComponentBase {
    direction: Direction;
    previous: boolean;
}

/** @hidden */
export abstract class IgxCarouselComponentBase {
    /** @hidden */
    public animationType: CarouselAnimationType = CarouselAnimationType.slide;

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
    /** @hidden */
    protected vertical = false;

    constructor(
        @Inject(IgxAngularAnimationService) private animationService: AnimationService,
        protected cdr: ChangeDetectorRef) {
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

        const trans = this.animationPosition ? this.animationPosition * 100 : 100;
        switch (this.animationType) {
            case CarouselAnimationType.slide:
                return {
                    enterAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `${this.vertical ? 'translateY' : 'translateX'}(${this.currentItem.direction === 1 ? trans : -trans}%)`,
                                toPosition: `${this.vertical ? 'translateY(0%)' : 'translateX(0%)'}`
                            }
                        }),
                    leaveAnimation: useAnimation(slideInLeft,
                        {
                            params: {
                                delay: '0s',
                                duration: `${duration}ms`,
                                endOpacity: 1,
                                startOpacity: 1,
                                fromPosition: `${this.vertical ? 'translateY(0%)' : 'translateX(0%)'}`,
                                toPosition: `${this.vertical ? 'translateY' : 'translateX'}(${this.currentItem.direction === 1 ? -trans : trans}%)`,
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

        this.enterAnimationPlayer = this.animationService.buildAnimation(animation, this.getCurrentElement());
        this.enterAnimationPlayer.animationEnd.subscribe(() => {
            // TODO: animation may never end. Find better way to clean up the player
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
            // TODO: animation may never end. Find better way to clean up the player
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
