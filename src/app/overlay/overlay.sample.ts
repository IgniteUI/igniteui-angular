import { Component, ViewChild, ElementRef } from '@angular/core';
import {
    IgxDropDownComponent,
    OverlaySettings,
    AutoPositionStrategy,
    GlobalPositionStrategy,
    ConnectedPositioningStrategy,
    AbsoluteScrollStrategy,
    BlockScrollStrategy,
    CloseScrollStrategy,
    NoOpScrollStrategy
} from 'igniteui-angular';
import { templateJitUrl } from '@angular/compiler';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'overlay-sample',
    styleUrls: ['overlay.sample.css'],
    templateUrl: './overlay.sample.html',
})
export class OverlaySampleComponent {
    private _overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };
    items = [
        'Item 1',
        'Item 2',
        'Item 3',
        'Item 4',
        'Item 5'
    ];

    horizontalDirections = ['Left', 'Center', 'Right'];
    horizontalDirection = 'Center';

    verticalDirections = ['Top', 'Middle', 'Bottom'];
    verticalDirection = 'Middle';

    horizontalStartPoints = ['Left', 'Center', 'Right'];
    horizontalStartPoint = 'Center';

    verticalStartPoints = ['Top', 'Middle', 'Bottom'];
    verticalStartPoint = 'Middle';

    positionStrategies = ['Auto', 'Connected', 'Global'];
    positionStrategy = 'Global';

    scrollStrategies = ['Absolute', 'Block', 'Close', 'NoOp'];
    scrollStrategy = 'NoOp';

    closeOnOutsideClick = true;
    modal = true;

    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;
    @ViewChild('button') public button: ElementRef;

    onChange(ev) {
        switch (ev.radio.name) {
            case 'hd':
                switch (ev.value) {
                    case 'Left':
                        this._overlaySettings.positionStrategy.settings.horizontalDirection = -1;
                        break;
                    case 'Center':
                        this._overlaySettings.positionStrategy.settings.horizontalDirection = -0.5;
                        break;
                    case 'Right':
                        this._overlaySettings.positionStrategy.settings.horizontalDirection = 0;
                        break;
                }
                break;
            case 'vd':
                switch (ev.value) {
                    case 'Top':
                        this._overlaySettings.positionStrategy.settings.verticalDirection = -1;
                        break;
                    case 'Middle':
                        this._overlaySettings.positionStrategy.settings.verticalDirection = -0.5;
                        break;
                    case 'Bottom':
                        this._overlaySettings.positionStrategy.settings.verticalDirection = 0;
                        break;
                }
                break;
            case 'hsp':
                switch (ev.value) {
                    case 'Left':
                        this._overlaySettings.positionStrategy.settings.horizontalStartPoint = -1;
                        break;
                    case 'Center':
                        this._overlaySettings.positionStrategy.settings.horizontalStartPoint = -0.5;
                        break;
                    case 'Right':
                        this._overlaySettings.positionStrategy.settings.horizontalStartPoint = 0;
                        break;
                }
                break;
            case 'vsp':
                switch (ev.value) {
                    case 'Top':
                        this._overlaySettings.positionStrategy.settings.verticalStartPoint = -1;
                        break;
                    case 'Middle':
                        this._overlaySettings.positionStrategy.settings.verticalStartPoint = -0.5;
                        break;
                    case 'Bottom':
                        this._overlaySettings.positionStrategy.settings.verticalStartPoint = 0;
                        break;
                }
                break;
            case 'ps':
                switch (ev.value) {
                    case 'Auto':
                        this._overlaySettings.positionStrategy = new AutoPositionStrategy();
                        break;
                    case 'Connected':
                        this._overlaySettings.positionStrategy = new ConnectedPositioningStrategy();
                        break;
                    case 'Global':
                        this._overlaySettings.positionStrategy = new GlobalPositionStrategy();
                        break;

                    default:
                        break;
                }
                break;
            case 'ss':
                switch (ev.value) {
                    case 'Absolute':
                        this._overlaySettings.scrollStrategy = new AbsoluteScrollStrategy();
                        break;
                    case 'Block':
                        this._overlaySettings.scrollStrategy = new BlockScrollStrategy();
                        break;
                    case 'Close':
                        this._overlaySettings.scrollStrategy = new CloseScrollStrategy();
                        break;
                    case 'NoOp':
                        this._overlaySettings.scrollStrategy = new NoOpScrollStrategy();
                        break;
                }
                break;
        }
    }

    onSwitchChange(ev) {
        switch (ev.switch.name) {
            case 'close':
                this._overlaySettings.closeOnOutsideClick = ev.checked;
                break;
            case 'modal':
                this._overlaySettings.modal = ev.checked;
                break;
        }
    }

    public toggleDropDown() {
        this._overlaySettings.positionStrategy.settings.target = this.button.nativeElement;
        this.igxDropDown.toggle(this._overlaySettings);
    }

}
