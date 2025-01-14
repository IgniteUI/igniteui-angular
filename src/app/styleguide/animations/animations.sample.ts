import { AnimationReferenceMetadata } from '@angular/animations';
import { NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
    AbsolutePosition,
    IgxDialogComponent, IgxListComponent, IgxListItemComponent, IgxOverlayService, IgxRippleDirective, IListItemClickEventArgs,
} from 'igniteui-angular';
import {
    blink, fadeIn, fadeOut, flipBottom, flipHorBck, flipHorFwd, flipLeft, flipRight, flipTop,
    flipVerBck, flipVerFwd, growVerIn, growVerOut, heartbeat,
    pulsateBck, pulsateFwd, rotateInBl,
    rotateInBottom, rotateInBr, rotateInCenter, rotateInDiagonal1, rotateInDiagonal2, rotateInHor,
    rotateInLeft, rotateInRight, rotateInTl, rotateInTop, rotateInTr, rotateInVer, rotateOutBl,
    rotateOutBottom, rotateOutBr, rotateOutCenter, rotateOutDiagonal1, rotateOutDiagonal2,
    rotateOutHor, rotateOutLeft, rotateOutRight, rotateOutTl, rotateOutTop, rotateOutTr,
    rotateOutVer, scaleInBl, scaleInBottom, scaleInBr, scaleInCenter, scaleInHorCenter,
    scaleInHorLeft, scaleInHorRight, scaleInLeft, scaleInRight, scaleInTl, scaleInTop, scaleInTr,
    scaleInVerBottom, scaleInVerCenter, scaleInVerTop, scaleOutBl, scaleOutBottom, scaleOutBr,
    scaleOutCenter, scaleOutHorCenter, scaleOutHorLeft, scaleOutHorRight, scaleOutLeft,
    scaleOutRight, scaleOutTl, scaleOutTop, scaleOutTr, scaleOutVerBottom, scaleOutVerCenter,
    scaleOutVerTop, shakeBl, shakeBottom, shakeBr, shakeCenter, shakeHor, shakeLeft, shakeRight,
    shakeTl, shakeTop, shakeTr, shakeVer, slideInBl, slideInBottom, slideInBr, slideInLeft,
    slideInRight, slideInTl, slideInTop, slideInTr, slideOutBl, slideOutBottom, slideOutBr,
    slideOutLeft, slideOutRight, slideOutTl, slideOutTop, slideOutTr, swingInBottomBck,
    swingInBottomFwd, swingInLeftBck, swingInLeftFwd, swingInRightBck, swingInRightFwd,
    swingInTopBck, swingInTopFwd, swingOutBottomBck, swingOutBottomFwd, swingOutLeftBck,
    swingOutLefttFwd, swingOutRightBck, swingOutRightFwd, swingOutTopBck, swingOutTopFwd
} from 'igniteui-angular/animations';

@Component({
    selector: 'app-animations-sample',
    styleUrls: ['animations.sample.scss'],
    templateUrl: 'animations.sample.html',
    imports: [IgxListComponent, NgFor, IgxListItemComponent, IgxRippleDirective, IgxDialogComponent]
})
export class AnimationsSampleComponent {
    @ViewChild('dialog', { static: true, read: IgxDialogComponent })
    private dialog: IgxDialogComponent;

    public animationsCategories: string[] = [
        'fade',
        'flip',
        'grow',
        'rotate',
        'scale',
        'slide',
        'swing',
        'shake',
        'pulsate'
    ];

    public animations: { name: string; animation: AnimationReferenceMetadata }[];

    private fadeAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'fadeIn', animation: fadeIn },
        { name: 'fadeOut', animation: fadeOut },
    ];

    private flipAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'flipTop', animation: flipTop },
        { name: 'flipRight', animation: flipRight },
        { name: 'flipBottom', animation: flipBottom },
        { name: 'flipLeft', animation: flipLeft },
        { name: 'flipHorFwd', animation: flipHorFwd },
        { name: 'flipHorBck', animation: flipHorBck },
        { name: 'flipVerFwd', animation: flipVerFwd },
        { name: 'flipVerBck', animation: flipVerBck }
    ];

    private growAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'growVerIn', animation: growVerIn },
        { name: 'growVerOut', animation: growVerOut },
    ];

    private rotateAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'rotateInCenter', animation: rotateInCenter },
        { name: 'rotateInTop', animation: rotateInTop },
        { name: 'rotateInRight', animation: rotateInRight },
        { name: 'rotateInLeft', animation: rotateInLeft },
        { name: 'rotateInBottom', animation: rotateInBottom },
        { name: 'rotateInTr', animation: rotateInTr },
        { name: 'rotateInBr', animation: rotateInBr },
        { name: 'rotateInBl', animation: rotateInBl },
        { name: 'rotateInTl', animation: rotateInTl },
        { name: 'rotateInDiagonal1', animation: rotateInDiagonal1 },
        { name: 'rotateInDiagonal2', animation: rotateInDiagonal2 },
        { name: 'rotateInHor', animation: rotateInHor },
        { name: 'rotateInVer', animation: rotateInVer },
        { name: 'rotateOutCenter', animation: rotateOutCenter },
        { name: 'rotateOutTop', animation: rotateOutTop },
        { name: 'rotateOutRight', animation: rotateOutRight },
        { name: 'rotateOutLeft', animation: rotateOutLeft },
        { name: 'rotateOutBottom', animation: rotateOutBottom },
        { name: 'rotateOutTr', animation: rotateOutTr },
        { name: 'rotateOutBr', animation: rotateOutBr },
        { name: 'rotateOutBl', animation: rotateOutBl },
        { name: 'rotateOutTl', animation: rotateOutTl },
        { name: 'rotateOutDiagonal1', animation: rotateOutDiagonal1 },
        { name: 'rotateOutDiagonal2', animation: rotateOutDiagonal2 },
        { name: 'rotateOutHor', animation: rotateOutHor },
        { name: 'rotateOutVer', animation: rotateOutVer }
    ];

    private scaleAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'scaleInTop', animation: scaleInTop },
        { name: 'scaleInRight', animation: scaleInRight },
        { name: 'scaleInBottom', animation: scaleInBottom },
        { name: 'scaleInLeft', animation: scaleInLeft },
        { name: 'scaleInCenter', animation: scaleInCenter },
        { name: 'scaleInTr', animation: scaleInTr },
        { name: 'scaleInBr', animation: scaleInBr },
        { name: 'scaleInBl', animation: scaleInBl },
        { name: 'scaleInTl', animation: scaleInTl },
        { name: 'scaleInVerTop', animation: scaleInVerTop },
        { name: 'scaleInVerBottom', animation: scaleInVerBottom },
        { name: 'scaleInVerCenter', animation: scaleInVerCenter },
        { name: 'scaleInHorCenter', animation: scaleInHorCenter },
        { name: 'scaleInHorLeft', animation: scaleInHorLeft },
        { name: 'scaleInHorRight', animation: scaleInHorRight },
        { name: 'scaleOutTop', animation: scaleOutTop },
        { name: 'scaleOutRight', animation: scaleOutRight },
        { name: 'scaleOutBottom', animation: scaleOutBottom },
        { name: 'scaleOutLeft', animation: scaleOutLeft },
        { name: 'scaleOutCenter', animation: scaleOutCenter },
        { name: 'scaleOutTr', animation: scaleOutTr },
        { name: 'scaleOutBr', animation: scaleOutBr },
        { name: 'scaleOutBl', animation: scaleOutBl },
        { name: 'scaleOutTl', animation: scaleOutTl },
        { name: 'scaleOutVerTop', animation: scaleOutVerTop },
        { name: 'scaleOutVerBottom', animation: scaleOutVerBottom },
        { name: 'scaleOutVerCenter', animation: scaleOutVerCenter },
        { name: 'scaleOutHorCenter', animation: scaleOutHorCenter },
        { name: 'scaleOutHorLeft', animation: scaleOutHorLeft },
        { name: 'scaleOutHorRight', animation: scaleOutHorRight }
    ];

    private slideAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'slideInTop', animation: slideInTop },
        { name: 'slideInRight', animation: slideInRight },
        { name: 'slideInBottom', animation: slideInBottom },
        { name: 'slideInLeft', animation: slideInLeft },
        { name: 'slideInTr', animation: slideInTr },
        { name: 'slideInBr', animation: slideInBr },
        { name: 'slideInBl', animation: slideInBl },
        { name: 'slideInTl', animation: slideInTl },
        { name: 'slideOutTop', animation: slideOutTop },
        { name: 'slideOutBottom', animation: slideOutBottom },
        { name: 'slideOutRight', animation: slideOutRight },
        { name: 'slideOutLeft', animation: slideOutLeft },
        { name: 'slideOutTr', animation: slideOutTr },
        { name: 'slideOutBr', animation: slideOutBr },
        { name: 'slideOutBl', animation: slideOutBl },
        { name: 'slideOutTl', animation: slideOutTl }
    ];

    private swingAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'swingInTopFwd', animation: swingInTopFwd },
        { name: 'swingInRightFwd', animation: swingInRightFwd },
        { name: 'swingInLeftFwd', animation: swingInLeftFwd },
        { name: 'swingInBottomFwd', animation: swingInBottomFwd },
        { name: 'swingInTopBck', animation: swingInTopBck },
        { name: 'swingInRightBck', animation: swingInRightBck },
        { name: 'swingInBottomBck', animation: swingInBottomBck },
        { name: 'swingInLeftBck', animation: swingInLeftBck },
        { name: 'swingOutTopFwd', animation: swingOutTopFwd },
        { name: 'swingOutRightFwd', animation: swingOutRightFwd },
        { name: 'swingOutBottomFwd', animation: swingOutBottomFwd },
        { name: 'swingOutLefttFwd', animation: swingOutLefttFwd },
        { name: 'swingOutTopBck', animation: swingOutTopBck },
        { name: 'swingOutRightBck', animation: swingOutRightBck },
        { name: 'swingOutBottomBck', animation: swingOutBottomBck },
        { name: 'swingOutLeftBck', animation: swingOutLeftBck }
    ];

    private shakeAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'shakeHor', animation: shakeHor },
        { name: 'shakeVer', animation: shakeVer },
        { name: 'shakeTop', animation: shakeTop },
        { name: 'shakeBottom', animation: shakeBottom },
        { name: 'shakeRight', animation: shakeRight },
        { name: 'shakeLeft', animation: shakeLeft },
        { name: 'shakeCenter', animation: shakeCenter },
        { name: 'shakeTr', animation: shakeTr },
        { name: 'shakeBr', animation: shakeBr },
        { name: 'shakeBl', animation: shakeBl },
        { name: 'shakeTl', animation: shakeTl }
    ];

    private pulsateAnimations: { name: string; animation: AnimationReferenceMetadata }[] = [
        { name: 'heartbeat', animation: heartbeat },
        { name: 'pulsateFwd', animation: pulsateFwd },
        { name: 'pulsateBck', animation: pulsateBck },
        { name: 'blink', animation: blink }
    ];

    constructor() {
        this.animations = this.fadeAnimations;
    }

    public categoryItemClicked(e: IListItemClickEventArgs): void {
        const category = this.animationsCategories[e.item.index];
        switch (category) {
            case 'fade':
                this.animations = this.fadeAnimations;
                break;
            case 'flip':
                this.animations = this.flipAnimations;
                break;
            case 'grow':
                this.animations = this.growAnimations;
                break;
            case 'rotate':
                this.animations = this.rotateAnimations;
                break;
            case 'scale':
                this.animations = this.scaleAnimations;
                break;
            case 'slide':
                this.animations = this.slideAnimations;
                break;
            case 'swing':
                this.animations = this.swingAnimations;
                break;
            case 'shake':
                this.animations = this.shakeAnimations;
                break;
            case 'pulsate':
                this.animations = this.pulsateAnimations;
                break;
        }
    }

    public playAnimation(e: IListItemClickEventArgs): void {
        const animation = this.animations[e.item.index].animation;
        if (animation.options?.params?.duration && animation.options?.params?.duration !== '1000ms') {
            animation.options.params.duration = '1000ms';
        }
        const overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(AbsolutePosition.Center);
        overlaySettings.closeOnOutsideClick = true;
        overlaySettings.modal = true;
        overlaySettings.positionStrategy.settings.openAnimation = animation;
        overlaySettings.positionStrategy.settings.closeAnimation = null;
        this.dialog.open(overlaySettings);
    }
}
