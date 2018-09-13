import { Component, ViewChild, ElementRef } from '@angular/core';
import {
    OverlaySettings,
    GlobalPositionStrategy,
    NoOpScrollStrategy,
    IgxToggleDirective,
    HorizontalAlignment
} from 'igniteui-angular';

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

    @ViewChild('audiToggle') public audiToggle: IgxToggleDirective;
    @ViewChild('bmwToggle') public bmwToggle: IgxToggleDirective;
    @ViewChild('mercedesToggle') public mercedesToggle: IgxToggleDirective;

    public mouseenter(ev) {
        this._overlaySettings.positionStrategy.settings.openAnimation.options.params.duration = '3000ms';
        this._overlaySettings.positionStrategy.settings.closeAnimation.options.params.duration = '3000ms';
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
