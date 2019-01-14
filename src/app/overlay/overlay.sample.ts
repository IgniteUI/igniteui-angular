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
    NoOpScrollStrategy,
    IgxInputGroupModule,
    ElasticPositionStrategy
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
    constructor() {
        for (let item = 0; item < 100; item++) {
            this.items.push(`Item ${item}`);
        }
    }

    items = [];

    buttonLeft = 90;
    buttonTop = 35;

    horizontalDirections = ['Left', 'Center', 'Right'];
    horizontalDirection = 'Left';

    verticalDirections = ['Top', 'Middle', 'Bottom'];
    verticalDirection = 'Top';

    horizontalStartPoints = ['Left', 'Center', 'Right'];
    horizontalStartPoint = 'Left';

    verticalStartPoints = ['Top', 'Middle', 'Bottom'];
    verticalStartPoint = 'Top';

    positionStrategies = ['Auto', 'Connected', 'Global', 'Elastic'];
    positionStrategy = 'Auto';

    scrollStrategies = ['Absolute', 'Block', 'Close', 'NoOp'];
    scrollStrategy = 'Absolute';

    closeOnOutsideClick = true;
    modal = true;

    @ViewChild(IgxDropDownComponent) public igxDropDown: IgxDropDownComponent;
    @ViewChild('button') public button: ElementRef;
    @ViewChild('container') public container: ElementRef;

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
                        this._overlaySettings = {
                            positionStrategy: new AutoPositionStrategy(),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: true,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        break;
                    case 'Connected':
                        this._overlaySettings = {
                            positionStrategy: new ConnectedPositioningStrategy(),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: true,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        break;
                    case 'Global':
                        this._overlaySettings.positionStrategy = new GlobalPositionStrategy();
                        this.horizontalDirection = 'Center';
                        this.verticalDirection = 'Middle';
                        this.horizontalStartPoint = 'Center';
                        this.verticalStartPoint = 'Middle';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        break;
                    case 'Elastic':
                        this._overlaySettings = {
                            positionStrategy: new ElasticPositionStrategy({
                                minSize: { width: 50, height: 50 }
                            }),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: true,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        break;
                    default:
                        break;
                }
                break;
            case 'ss':
                switch (ev.value) {
                    case 'Absolute':
                        this._overlaySettings.scrollStrategy =
                            new AbsoluteScrollStrategy();
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

    onChange2() { // WIP
        const stringMapping = {
            'ScrollStrategy': {
                'Absolute': new AbsoluteScrollStrategy(),
                'Block': new BlockScrollStrategy(),
                'Close': new CloseScrollStrategy(),
                'NoOp': new NoOpScrollStrategy()
            },
            'PositionStrategy': {
                'Auto': new AutoPositionStrategy(),
                'Connected': new ConnectedPositioningStrategy(),
                'Global': new GlobalPositionStrategy(),
                'Elastic': new ElasticPositionStrategy({
                    minSize: { width: 50, height: 50 }
                }),
            },
            'VerticalDirection': {
                'Top': -1,
                'Middle': -0.5,
                'Bottom': 0
            },
            'VerticalStartPoint': {
                'Top': -1,
                'Middle': -0.5,
                'Bottom': 0
            },
            'HorizontalDirection': {
                'Left': -1,
                'Center': -0.5,
                'Right': 0
            },
            'HorizontalStartPoint': {
                'Left': -1,
                'Center': -0.5,
                'Right': 0
            }
        };

        this._overlaySettings = {
            positionStrategy: stringMapping['PositionStrategy'][this.positionStrategy],
            scrollStrategy: stringMapping['ScrollStrategy'][this.scrollStrategy],
            modal: this.modal,
            closeOnOutsideClick: this.closeOnOutsideClick
        };
        this._overlaySettings.positionStrategy.settings.verticalDirection =
            stringMapping['VerticalDirection'][this.verticalDirection];
        this._overlaySettings.positionStrategy.settings.verticalStartPoint =
            stringMapping['VerticalStartPoint'][this.verticalStartPoint];
        this._overlaySettings.positionStrategy.settings.horizontalDirection =
            stringMapping['HorizontalDirection'][this.horizontalDirection];
        this._overlaySettings.positionStrategy.settings.horizontalStartPoint =
            stringMapping['HorizontalStartPoint'][this.horizontalStartPoint];
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
        this.onChange2();
        this._overlaySettings.positionStrategy.settings.target = this.button.nativeElement;
        this.igxDropDown.toggle(this._overlaySettings);
    }

}
