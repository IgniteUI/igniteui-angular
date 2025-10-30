import { AnimationBuilder, AnimationReferenceMetadata } from '@angular/animations';
import { Injectable } from '@angular/core';
import { IgxAngularAnimationPlayer } from './angular-animation-player';
import { AnimationService, AnimationPlayer } from './animation';

@Injectable({providedIn: 'root'})
export class IgxAngularAnimationService implements AnimationService {
    constructor(private builder: AnimationBuilder) { }
    public buildAnimation(animationMetaData: AnimationReferenceMetadata, element: HTMLElement): AnimationPlayer {
        if (!animationMetaData) {
            return null;
        }
        const animationBuilder = this.builder.build(animationMetaData);
        const player = new IgxAngularAnimationPlayer(animationBuilder.create(element));
        return player;
    }
}
