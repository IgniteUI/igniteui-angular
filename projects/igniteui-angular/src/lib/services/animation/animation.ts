import { AnimationBuilder, AnimationPlayer, AnimationReferenceMetadata } from '@angular/animations';
import { EventEmitter, Injectable } from '@angular/core';
import { IBaseEventArgs } from '../../core/utils';

@Injectable({providedIn: 'root'})
export class IgxAnimationService {
    constructor(private builder: AnimationBuilder) { }

    public buildAnimation(animation: AnimationReferenceMetadata, element: HTMLElement): IgxAnimationPlayer {
        if (!animation) {
            return null;
        }
        const animationBuilder = this.builder.build(animation);
        const player = new IgxAnimationPlayer(animationBuilder.create(element));
        return player;
    }
}

export interface IAnimationPlayer{
    onStart(fn: () => void): void;
    onDone(fn: () => void): void;
    reset(): void;
    hasStarted(): boolean;
    destroy(): void;
    getPosition(): number;
    setPosition(position: any /** TODO #9100 */): void;
    play(): void;
    init(): void;
    finish(): void;
}

export class IgxAnimationPlayer {
    private _innerPlayer: AnimationPlayer;
    public animationStart: EventEmitter<IBaseEventArgs> = new EventEmitter<IBaseEventArgs>();
    public animationEnd: EventEmitter<IBaseEventArgs> = new EventEmitter<IBaseEventArgs>();

    public get Position(): number {
        return this._innerPlayer.getPosition();
    }

    public set Position(value: number) {
        this.internalPlayer.setPosition(value);
    }

    constructor(private internalPlayer: IAnimationPlayer) {
        this.internalPlayer.onDone(() => this.onDone());
        const innerRenderer  = (this.internalPlayer as any)._renderer;
            //  We need inner player as Angular.AnimationPlayer.getPosition returns always 0.
            // To workaround this we are getting the positions from the inner player.
            //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
            //  As soon as this is resolved we can remove this hack
            this._innerPlayer = innerRenderer.engine.players[innerRenderer.engine.players.length - 1];
    }

    public init(): void {
        this.internalPlayer.init();
    }

    public play(): void {
        this.animationStart.emit({owner: this});
        this.internalPlayer.play();
    }

    public finish(): void {
        this.internalPlayer.finish();
        // TODO: when animation finish angular deletes all onDone handlers. Add handlers again if needed
        }

    public reset(): void {
        this.internalPlayer.reset();
        // calling reset does not change hasStarted to false. This is why we are doing it here via internal field
        (this.internalPlayer as any)._started = false;
    }

    public destroy(): void {
        this.internalPlayer.destroy();
    }

    public hasStarted(): boolean {
        return this.internalPlayer.hasStarted();
    }

    private onDone(): void {
        this.animationEnd.emit({owner: this});
    }
}
