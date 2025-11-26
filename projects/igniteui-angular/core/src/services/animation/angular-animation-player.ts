import { AnimationPlayer as AngularAnimationPlayer } from '@angular/animations';
import { EventEmitter } from '@angular/core';
import { IBaseEventArgs } from '../../core/utils';
import { AnimationPlayer } from './animation';

export class IgxAngularAnimationPlayer implements AnimationPlayer {
    private _innerPlayer: AngularAnimationPlayer;
    public animationStart: EventEmitter<IBaseEventArgs> = new EventEmitter<IBaseEventArgs>();
    public animationEnd: EventEmitter<IBaseEventArgs> = new EventEmitter<IBaseEventArgs>();

    public get position(): number {
        return this._innerPlayer.getPosition();
    }

    public set position(value: number) {
        this.internalPlayer.setPosition(value);
    }

    constructor(private internalPlayer: AngularAnimationPlayer) {
        this.internalPlayer.onDone(() => this.onDone());
        const innerRenderer = (this.internalPlayer as any)._renderer;
        //  We need inner player as Angular.AnimationPlayer.getPosition returns always 0.
        // To workaround this we are getting the positions from the inner player.
        //  This is logged in Angular here - https://github.com/angular/angular/issues/18891
        //  As soon as this is resolved we can remove this hack
        const rendererEngine = innerRenderer.engine || innerRenderer.delegate.engine;
        // A workaround because of Angular SSR is using some delegation.
        this._innerPlayer = rendererEngine.players[rendererEngine.players.length - 1];
    }

    public init(): void {
        this.internalPlayer.init();
    }

    public play(): void {
        this.animationStart.emit({ owner: this });
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
        this.animationEnd.emit({ owner: this });
    }
}
