import { Component, ViewChild } from '@angular/core';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    HorizontalAlignment
} from 'igniteui-angular';
import { AnimationReferenceMetadata, animation, style, AnimationMetadata, animate } from '@angular/animations';
import { IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective } from '../../../projects/igniteui-angular/src/lib/card/card.component';
import { IgxToggleDirective as IgxToggleDirective_1 } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'overlay-animation-sample',
    templateUrl: './overlay-animation.sample.html',
    styleUrls: ['overlay-animation.sample.scss'],
    standalone: true,
    imports: [IgxAvatarComponent, IgxToggleDirective_1, IgxCardComponent, IgxCardHeaderComponent, IgxCardContentDirective]
})
export class OverlayAnimationSampleComponent {
    @ViewChild('audiToggle', { static: true }) public audiToggle: IgxToggleDirective;
    @ViewChild('bmwToggle', { static: true }) public bmwToggle: IgxToggleDirective;
    @ViewChild('mercedesToggle', { static: true }) public mercedesToggle: IgxToggleDirective;

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
}
