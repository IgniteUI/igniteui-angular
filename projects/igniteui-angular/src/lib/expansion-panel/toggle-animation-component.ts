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

enum ANIMATION_TYPE {
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

        if (target.hasStarted()) {
            return;
        }

        const targetEmitter = type === ANIMATION_TYPE.OPEN ? this.openAnimationStart : this.closeAnimationStart;
        targetEmitter.emit();
        target.play();
    }

    private initializePlayer(type: ANIMATION_TYPE, targetElement: ElementRef, callback: () => void): AnimationPlayer {
        const oppositeType = type === ANIMATION_TYPE.OPEN ? ANIMATION_TYPE.CLOSE : ANIMATION_TYPE.OPEN;
        const animationSettings = type === ANIMATION_TYPE.OPEN ?
        this.animationSettings.openAnimation : this.animationSettings.closeAnimation;
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
        if (type === ANIMATION_TYPE.OPEN) {
            this.onOpenedCallback = callback;
        } else if (type === ANIMATION_TYPE.CLOSE) {
            this.onClosedCallback = callback;
        }
        const targetCallback = type === ANIMATION_TYPE.OPEN ? this.onOpenedCallback : this.onClosedCallback;
        const targetEmitter = type === ANIMATION_TYPE.OPEN ? this.openAnimationDone : this.closeAnimationDone;
        target.onDone(() => {
            targetCallback();
            targetEmitter.emit();
            this.cleanUpPlayer(type);
        });
        return target;
    }


    private cleanUpPlayer(target: ANIMATION_TYPE) {
        switch (target) {
            case ANIMATION_TYPE.CLOSE:
                if (this.closeAnimationPlayer != null) {
                    this.closeAnimationPlayer.reset();
                    this.closeAnimationPlayer.destroy();
                    this.closeAnimationPlayer = null;
                }
                this.onClosedCallback = this._defaultClosedCallback;
                break;
            case ANIMATION_TYPE.OPEN:
                if (this.openAnimationPlayer != null) {
                    this.openAnimationPlayer.reset();
                    this.openAnimationPlayer.destroy();
                    this.openAnimationPlayer = null;
                }
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
