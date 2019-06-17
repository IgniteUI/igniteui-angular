import { Component, ViewChild, ElementRef } from '@angular/core';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    HorizontalAlignment,
    scaleInTop,
    scaleOutTop
} from 'igniteui-angular';
import { AnimationReferenceMetadata, animation, style, AnimationMetadata, animate } from '@angular/animations';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'overlay-animation-sample',
    templateUrl: './overlay-animation.sample.html',
    styleUrls: ['overlay-animation.sample.scss']
})
export class OverlayAnimationSampleComponent {
    private _overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

    @ViewChild('audiToggle', { static: true }) public audiToggle: IgxToggleDirective;
    @ViewChild('bmwToggle', { static: true }) public bmwToggle: IgxToggleDirective;
    @ViewChild('mercedesToggle', { static: true }) public mercedesToggle: IgxToggleDirective;

    public mouseenter(ev) {
        const openAnimationMetaData: AnimationMetadata[] = [
            style({ opacity: `0`, transform: `scale(0.5)`, transformOrigin: `50% 50%` }),
            animate(`3000ms`, style({ opacity: `1`, transform: `scale(1)`, transformOrigin: `50% 50%` }))
        ];
        const openAnimation: AnimationReferenceMetadata = animation(openAnimationMetaData);
        this._overlaySettings.positionStrategy.settings.openAnimation = openAnimation;
        this._overlaySettings.closeOnOutsideClick = false;

        const closeAnimationMetaData: AnimationMetadata[] = [
            style({ opacity: `1`, transform: `scale(1)`, transformOrigin: `50% 50%` }),
            animate(`6000ms`, style({ opacity: `0`, transform: `scale(0.5)`, transformOrigin: `50% 50%` }))
        ];
        const closeAnimation: AnimationReferenceMetadata = animation(closeAnimationMetaData);
        this._overlaySettings.positionStrategy.settings.closeAnimation = closeAnimation;
        switch (ev.target.id) {
            case 'audi':
                this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Left;
                this.audiToggle.open(this._overlaySettings);
                break;
            case 'bmw':
                this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Center;
                this.bmwToggle.open(this._overlaySettings);
                break;
            case 'mercedes':
                this._overlaySettings.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Right;
                this.mercedesToggle.open(this._overlaySettings);
                break;
        }
    }

    public mouseleave(ev) {
        switch (ev.target.id) {
            case 'audi':
                this.audiToggle.close();
                break;
            case 'bmw':
                this.bmwToggle.close();
                break;
            case 'mercedes':
                this.mercedesToggle.close();
                break;
        }
    }
}
