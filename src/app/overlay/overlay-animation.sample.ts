import { Component, ViewChild } from '@angular/core';
import { AnimationReferenceMetadata, animation, style, AnimationMetadata, animate } from '@angular/animations';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    HorizontalAlignment,
    IgxAvatarComponent,
    IGX_CARD_DIRECTIVES,
    ConnectedPositioningStrategy,
    VerticalAlignment
} from 'igniteui-angular';

@Component({
    selector: 'overlay-animation-sample',
    templateUrl: './overlay-animation.sample.html',
    styleUrls: ['overlay-animation.sample.scss'],
    imports: [IgxAvatarComponent, IgxToggleDirective, IGX_CARD_DIRECTIVES]
})
export class OverlayAnimationSampleComponent {
    @ViewChild('audiToggle', { static: true }) public audiToggle: IgxToggleDirective;
    @ViewChild('bmwToggle', { static: true }) public bmwToggle: IgxToggleDirective;
    @ViewChild('mercedesToggle', { static: true }) public mercedesToggle: IgxToggleDirective;
    @ViewChild('commonToggle', { static: true }) public commonToggle: IgxToggleDirective;

    private _overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: false,
        closeOnOutsideClick: true
    };

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
    public mouseenterReuse(ev) {
        const os: OverlaySettings = {
            positionStrategy: new ConnectedPositioningStrategy(),
            scrollStrategy: new NoOpScrollStrategy(),
            modal: false,
            closeOnOutsideClick: false,
        };
    
        os.positionStrategy.settings.horizontalDirection = HorizontalAlignment.Center;
        os.positionStrategy.settings.horizontalStartPoint = HorizontalAlignment.Center;
        os.positionStrategy.settings.verticalDirection = VerticalAlignment.Bottom;
        os.positionStrategy.settings.verticalStartPoint = VerticalAlignment.Bottom;
        os.target = ev.target;

        const closeAnimationMetaData: AnimationMetadata[] = [
            style({ opacity: `1`, transform: `scale(1)`, transformOrigin: `50% 50%` }),
            animate(`6000ms`, style({ opacity: `0`, transform: `scale(0.5)`, transformOrigin: `50% 50%` }))
        ];
        const closeAnimation: AnimationReferenceMetadata = animation(closeAnimationMetaData);
        this._overlaySettings.positionStrategy.settings.closeAnimation = closeAnimation;
        switch (ev.target.id) {
            case 'audi':
                this.commonToggle.open(os);
                break;
            case 'bmw':
                this.commonToggle.open(os);
                break;
            case 'mercedes':
                this.commonToggle.open(os);
                break;
        }
    }
    public mouseleaveReuse(ev) {
        switch (ev.target.id) {
            case 'audi':
                this.commonToggle.close();
                break;
            case 'bmw':
                this.commonToggle.close();
                break;
            case 'mercedes':
                this.commonToggle.close();
                break;
        }
    }
}
