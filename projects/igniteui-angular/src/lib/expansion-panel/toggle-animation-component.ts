import { AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata, useAnimation } from '@angular/animations';
import { Directive, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { noop, Subject } from 'rxjs';
import { growVerIn, growVerOut } from '../animations/grow';

/**@hidden @internal */
export interface ToggleAnimationSettings {
    openAnimation: AnimationReferenceMetadata;
    closeAnimation: AnimationReferenceMetadata;
}

export interface ToggleAnimationOwner {
    animationSettings: ToggleAnimationSettings;
    openAnimationStart: EventEmitter<void>;
    openAnimationDone: EventEmitter<void>;
    closeAnimationStart: EventEmitter<void>;
    closeAnimationDone: EventEmitter<void>;
    openAnimationPlayer: AnimationPlayer;
    closeAnimationPlayer: AnimationPlayer;
    playOpenAnimation(element: ElementRef, onDone: () => void): void;
    playCloseAnimation(element: ElementRef, onDone: () => void): void;
}

/** @hidden @internal */
export enum ANIMATION_TYPE {
    OPEN = 'open',
    CLOSE = 'close',
}

/**@hidden @internal */
@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class ToggleAnimationPlayer implements ToggleAnimationOwner, OnDestroy {


    /** @hidden @internal */
    public openAnimationDone: EventEmitter<void> = new EventEmitter();
    /** @hidden @internal */
    public closeAnimationDone: EventEmitter<void> = new EventEmitter();
    /** @hidden @internal */
    public openAnimationStart: EventEmitter<void> = new EventEmitter();
    /** @hidden @internal */
    public closeAnimationStart: EventEmitter<void> = new EventEmitter();

    public get animationSettings(): ToggleAnimationSettings {
        return this._animationSettings;
    }
    public set animationSettings(value: ToggleAnimationSettings) {
        this._animationSettings = value;
    }

    /** @hidden @internal */
    public openAnimationPlayer: AnimationPlayer = null;

    /** @hidden @internal */
    public closeAnimationPlayer: AnimationPlayer = null;



    protected destroy$: Subject<void> = new Subject();
    protected players: Map<string, AnimationPlayer> = new Map();
    protected _animationSettings: ToggleAnimationSettings = {
        openAnimation: growVerIn,
        closeAnimation: growVerOut
    };

    private closeInterrupted = false;
    private openInterrupted = false;

    private _defaultClosedCallback = noop;
    private _defaultOpenedCallback = noop;
    private onClosedCallback: () => any = this._defaultClosedCallback;
    private onOpenedCallback: () => any = this._defaultOpenedCallback;

    constructor(protected builder: AnimationBuilder) {
    }

    /** @hidden @internal */
    public playOpenAnimation(targetElement: ElementRef, onDone?: () => void): void {
        this.startPlayer(ANIMATION_TYPE.OPEN, targetElement, onDone || this._defaultOpenedCallback);
    }

    /** @hidden @internal */
    public playCloseAnimation(targetElement: ElementRef, onDone?: () => void): void {
        this.startPlayer(ANIMATION_TYPE.CLOSE, targetElement, onDone || this._defaultClosedCallback);
    }
    public ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private startPlayer(type: ANIMATION_TYPE, targetElement: ElementRef, callback: () => void): void {
        if (!targetElement) { // if no element is passed, there is nothing to animate
            return;
        }

        let target = this.getPlayer(type);
        if (!target) {
            target = this.initializePlayer(type, targetElement, callback);
        }

        // V.S. Jun 28th, 2021 #9783: player will NOT be initialized w/ null settings
        // events will already be emitted
        if (!target || target.hasStarted()) {
            return;
        }

        const targetEmitter = type === ANIMATION_TYPE.OPEN ? this.openAnimationStart : this.closeAnimationStart;
        targetEmitter.emit();
        if (target) {
            target.play();
        }
    }

    private initializePlayer(type: ANIMATION_TYPE, targetElement: ElementRef, callback: () => void): AnimationPlayer {
        const oppositeType = type === ANIMATION_TYPE.OPEN ? ANIMATION_TYPE.CLOSE : ANIMATION_TYPE.OPEN;
        // V.S. Jun 28th, 2021 #9783: Treat falsy animation settings as disabled animations
        const targetAnimationSettings = this.animationSettings || { closeAnimation: null, openAnimation: null };
        const animationSettings = type === ANIMATION_TYPE.OPEN ?
            targetAnimationSettings.openAnimation : targetAnimationSettings.closeAnimation;
        // V.S. Jun 28th, 2021 #9783: When no animation in target direction, emit start and done events and return
        if (!animationSettings) {
            this.setCallback(type, callback);
            const targetEmitter = type === ANIMATION_TYPE.OPEN ? this.openAnimationStart : this.closeAnimationStart;
            targetEmitter.emit();
            this.onDoneHandler(type);
            return;
        }
        const animation = useAnimation(animationSettings);
        const animationBuilder = this.builder.build(animation);
        const opposite = this.getPlayer(oppositeType);
        let oppositePosition = 1;
        if (opposite) {
            if (opposite.hasStarted()) {
                // .getPosition() still returns 0 sometimes, regardless of the fix for https://github.com/angular/angular/issues/18891;
                oppositePosition = (opposite as any)._renderer.engine.players[0].getPosition();
            }

            this.cleanUpPlayer(oppositeType);
        }
        if (type === ANIMATION_TYPE.OPEN) {
            this.openAnimationPlayer = animationBuilder.create(targetElement.nativeElement);
        } else if (type === ANIMATION_TYPE.CLOSE) {
            this.closeAnimationPlayer = animationBuilder.create(targetElement.nativeElement);
        }
        const target = this.getPlayer(type);
        target.init();
        this.getPlayer(type).setPosition(1 - oppositePosition);
        this.setCallback(type, callback);
        target.onDone(() => {
            this.onDoneHandler(type);
        });
        return target;
    }

    private onDoneHandler(type) {
        const targetEmitter = type === ANIMATION_TYPE.OPEN ? this.openAnimationDone : this.closeAnimationDone;
        const targetCallback = type === ANIMATION_TYPE.OPEN ? this.onOpenedCallback : this.onClosedCallback;
        targetCallback();
        if (!(type === ANIMATION_TYPE.OPEN ? this.openInterrupted : this.closeInterrupted)) {
            targetEmitter.emit();
        }
        this.cleanUpPlayer(type);
    }

    private setCallback(type: ANIMATION_TYPE, callback: () => void) {
        if (type === ANIMATION_TYPE.OPEN) {
            this.onOpenedCallback = callback;
            this.openInterrupted = false;
        } else if (type === ANIMATION_TYPE.CLOSE) {
            this.onClosedCallback = callback;
            this.closeInterrupted = false;
        }
    }


    private cleanUpPlayer(target: ANIMATION_TYPE) {
        switch (target) {
            case ANIMATION_TYPE.CLOSE:
                if (this.closeAnimationPlayer != null) {
                    this.closeAnimationPlayer.reset();
                    this.closeAnimationPlayer.destroy();
                    this.closeAnimationPlayer = null;
                }
                this.closeInterrupted = true;
                this.onClosedCallback = this._defaultClosedCallback;
                break;
            case ANIMATION_TYPE.OPEN:
                if (this.openAnimationPlayer != null) {
                    this.openAnimationPlayer.reset();
                    this.openAnimationPlayer.destroy();
                    this.openAnimationPlayer = null;
                }
                this.openInterrupted = true;
                this.onOpenedCallback = this._defaultOpenedCallback;
                break;
            default:
                break;
        }
    }

    private getPlayer(type: ANIMATION_TYPE): AnimationPlayer {
        switch (type) {
            case ANIMATION_TYPE.OPEN:
                return this.openAnimationPlayer;
            case ANIMATION_TYPE.CLOSE:
                return this.closeAnimationPlayer;
            default:
                return null;
        }
    }
}
