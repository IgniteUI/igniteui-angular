import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class OverlaySampleComponent implements OnInit {
    private _overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };
    constructor(
        private cdr: ChangeDetectorRef
    ) {
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
            case 'ps':
                this.removeSelectedClass('direction');
                this.removeSelectedClass('start-point');
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
                        document.getElementById('brd').classList.add('selected');
                        document.getElementById('blsp').classList.add('selected');
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
                        document.getElementById('brd').classList.add('selected');
                        document.getElementById('blsp').classList.add('selected');
                        break;
                    case 'Global':
                        this._overlaySettings.positionStrategy = new GlobalPositionStrategy();
                        this.horizontalDirection = 'Center';
                        this.verticalDirection = 'Middle';
                        this.horizontalStartPoint = 'Center';
                        this.verticalStartPoint = 'Middle';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        document.getElementById('mcd').classList.add('selected');
                        document.getElementById('mcsp').classList.add('selected');
                        break;
                    case 'Elastic':
                        this._overlaySettings = {
                            positionStrategy: new ElasticPositionStrategy({
                                minSize: { width: 150, height: 150 }
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
                        document.getElementById('brd').classList.add('selected');
                        document.getElementById('blsp').classList.add('selected');
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
                    minSize: { width: 150, height: 150 }
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

    public setDirection(e) {
        switch (e.target.id) {
            case 'tld':
                this.verticalDirection = 'Top';
                this.horizontalDirection = 'Left';
                break;
            case 'tcd':
                this.verticalDirection = 'Top';
                this.horizontalDirection = 'Center';
                break;
            case 'trd':
                this.verticalDirection = 'Top';
                this.horizontalDirection = 'Right';
                break;
            case 'mld':
                this.verticalDirection = 'Middle';
                this.horizontalDirection = 'Left';
                break;
            case 'mcd':
                this.verticalDirection = 'Middle';
                this.horizontalDirection = 'Center';
                break;
            case 'mrd':
                this.verticalDirection = 'Middle';
                this.horizontalDirection = 'Right';
                break;
            case 'bld':
                this.verticalDirection = 'Bottom';
                this.horizontalDirection = 'Left';
                break;
            case 'bcd':
                this.verticalDirection = 'Bottom';
                this.horizontalDirection = 'Center';
                break;
            case 'brd':
                this.verticalDirection = 'Bottom';
                this.horizontalDirection = 'Right';
                break;
        }

        const old = document.getElementsByClassName('selected');
        if (old.length > 0) {
            old[0].classList.remove('selected');
        }

        this.removeSelectedClass('direction');
        e.target.classList.add('selected');
    }

    public setStartPoint(e) {
        switch (e.target.id) {
            case 'tlsp':
                this.verticalStartPoint = 'Top';
                this.horizontalStartPoint = 'Left';
                break;
            case 'tcsp':
                this.verticalStartPoint = 'Top';
                this.horizontalStartPoint = 'Center';
                break;
            case 'trsp':
                this.verticalStartPoint = 'Top';
                this.horizontalStartPoint = 'Right';
                break;
            case 'mlsp':
                this.verticalStartPoint = 'Middle';
                this.horizontalStartPoint = 'Left';
                break;
            case 'mcsp':
                this.verticalStartPoint = 'Middle';
                this.horizontalStartPoint = 'Center';
                break;
            case 'mrsp':
                this.verticalStartPoint = 'Middle';
                this.horizontalStartPoint = 'Right';
                break;
            case 'blsp':
                this.verticalStartPoint = 'Bottom';
                this.horizontalStartPoint = 'Left';
                break;
            case 'bcsp':
                this.verticalStartPoint = 'Bottom';
                this.horizontalStartPoint = 'Center';
                break;
            case 'brsp':
                this.verticalStartPoint = 'Bottom';
                this.horizontalStartPoint = 'Right';
                break;
        }

        this.removeSelectedClass('start-point');
        e.target.classList.add('selected');
    }

    private removeSelectedClass(type: string) {
        const items = document.getElementsByClassName(type);
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            element.classList.remove('selected');
        }
    }

    public toggleDropDown() {
        if (this.igxDropDown.collapsed) {
            this.items = [];
            for (let item = 0; item < 12; item++) {
                this.items.push(`Item ${item}`);
            }
            this.cdr.detectChanges();
            this.onChange2();
            this._overlaySettings.positionStrategy.settings.target = this.button.nativeElement;
        }
        this.igxDropDown.toggle(this._overlaySettings);
    }

    public resizeAndSoOn() {
        this.items = [];
        for (let item = 0; item < 1; item++) {
            this.items.push(`Item ${item}`);
        }

        this.cdr.detectChanges();
        (<any>this.igxDropDown).toggleDirective.reposition();
    }

    ngOnInit(): void {
        this.igxDropDown.element.childElements[0].style.maxHeight = '100%';
    }
}
