import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
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
    ElasticPositionStrategy,
    IgxDragDirective,
    ContainerPositionStrategy,
    IgxRadioComponent,
    IgxSwitchComponent,
    IgxInputGroupComponent,
    IgxInputDirective,
    IgxLabelDirective,
    IgxButtonDirective,
    IgxRippleDirective,
    IgxDropDownItemComponent,
    IChangeCheckboxEventArgs
} from 'igniteui-angular';
import { IAnimationParams } from 'igniteui-angular/animations';

@Component({
    selector: 'overlay-sample',
    styleUrls: ['overlay.sample.css'],
    templateUrl: './overlay.sample.html',
    imports: [NgFor, IgxRadioComponent, FormsModule, IgxSwitchComponent, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgxButtonDirective, IgxRippleDirective, IgxDragDirective, IgxDropDownComponent, IgxDropDownItemComponent]
})
export class OverlaySampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild(IgxDragDirective, { static: true })
    private igxDrag: IgxDragDirective;
    @ViewChild('outlet', { static: true })
    private outletElement: ElementRef;

    public items = [];
    public itemsCount = 10;
    public dropDownWidth = 200;
    public horizontalDirections = ['Left', 'Center', 'Right'];
    public horizontalDirection = 'Center';
    public verticalDirections = ['Top', 'Middle', 'Bottom'];
    public verticalDirection = 'Middle';
    public horizontalStartPoints = ['Left', 'Center', 'Right'];
    public horizontalStartPoint = 'Left';
    public verticalStartPoints = ['Top', 'Middle', 'Bottom'];
    public verticalStartPoint = 'Top';
    public positionStrategies = ['Auto', 'Connected', 'Global', 'Container', 'Elastic'];
    public positionStrategy = 'Global';
    public scrollStrategies = ['Absolute', 'Block', 'Close', 'NoOp'];
    public scrollStrategy = 'NoOp';
    public closeOnOutsideClick = true;
    public modal = true;
    public useOutlet = false;
    public hasAnimation = true;
    public animationLength = 300; // in ms

    private xAddition = 0;
    private yAddition = 0;

    private _overlaySettings: OverlaySettings = {
        positionStrategy: new GlobalPositionStrategy(),
        scrollStrategy: new NoOpScrollStrategy(),
        modal: true,
        closeOnOutsideClick: true
    };
    constructor(
        private cdr: ChangeDetectorRef
    ) {
        for (let item = 0; item < this.itemsCount; item++) {
            this.items.push(`Item ${item}`);
        }
    }

    public onChange(ev: IChangeCheckboxEventArgs) {
        switch (ev.owner.name) {
            case 'ps':
                this.removeSelectedClass('direction');
                this.removeSelectedClass('start-point');
                switch (ev.value) {
                    case 'Auto':
                        this._overlaySettings = {
                            positionStrategy: new AutoPositionStrategy(),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: false,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = false;
                        document.getElementById('brd').classList.add('selected');
                        document.getElementById('blsp').classList.add('selected');
                        break;
                    case 'Connected':
                        this._overlaySettings = {
                            positionStrategy: new ConnectedPositioningStrategy(),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: false,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = false;
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
                    case 'Container':
                        this._overlaySettings.positionStrategy = new ContainerPositionStrategy();
                        this.horizontalDirection = 'Center';
                        this.verticalDirection = 'Middle';
                        this.horizontalStartPoint = 'Center';
                        this.verticalStartPoint = 'Middle';
                        this.closeOnOutsideClick = true;
                        this.modal = true;
                        this.useOutlet = true;
                        document.getElementById('mcd').classList.add('selected');
                        document.getElementById('mcsp').classList.add('selected');
                        break;
                    case 'Elastic':
                        this._overlaySettings = {
                            positionStrategy: new ElasticPositionStrategy({
                                minSize: { width: 150, height: 150 }
                            }),
                            scrollStrategy: new NoOpScrollStrategy(),
                            modal: false,
                            closeOnOutsideClick: true
                        };
                        this.horizontalDirection = 'Right';
                        this.verticalDirection = 'Bottom';
                        this.horizontalStartPoint = 'Left';
                        this.verticalStartPoint = 'Bottom';
                        this.closeOnOutsideClick = true;
                        this.modal = false;
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

    public onChange2() { // WIP
        const stringMapping = {
            ScrollStrategy: {
                Absolute: new AbsoluteScrollStrategy(),
                Block: new BlockScrollStrategy(),
                Close: new CloseScrollStrategy(),
                NoOp: new NoOpScrollStrategy()
            },
            PositionStrategy: {
                Auto: new AutoPositionStrategy(),
                Connected: new ConnectedPositioningStrategy(),
                Global: new GlobalPositionStrategy(),
                Container: new ContainerPositionStrategy(),
                Elastic: new ElasticPositionStrategy({
                    minSize: { width: 150, height: 150 }
                }),
            },
            VerticalDirection: {
                Top: -1,
                Middle: -0.5,
                Bottom: 0
            },
            VerticalStartPoint: {
                Top: -1,
                Middle: -0.5,
                Bottom: 0
            },
            HorizontalDirection: {
                Left: -1,
                Center: -0.5,
                Right: 0
            },
            HorizontalStartPoint: {
                Left: -1,
                Center: -0.5,
                Right: 0
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
        this._overlaySettings.outlet = this.useOutlet ? this.outletElement : null;
    }

    public onSwitchChange(ev: IChangeCheckboxEventArgs) {
        switch (ev.owner.name) {
            case 'close':
                this._overlaySettings.closeOnOutsideClick = ev.checked;
                break;
            case 'modal':
                this._overlaySettings.modal = ev.checked;
                break;
            case 'outlet':
                this._overlaySettings.outlet = ev.checked ? this.outletElement : null;
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

    public toggleDropDown() {
        if (this.igxDropDown.collapsed) {
            this.items = [];
            for (let item = 0; item < this.itemsCount; item++) {
                this.items.push(`Item ${item}`);
            }
            this.cdr.detectChanges();
            this.onChange2();
            this._overlaySettings.target = this.button.nativeElement;
            (this._overlaySettings.positionStrategy.settings.openAnimation.options.params as IAnimationParams).duration
                = `${this.animationLength}ms`;
            (this._overlaySettings.positionStrategy.settings.closeAnimation.options.params as IAnimationParams).duration
                = `${this.animationLength}ms`;
            if (!this.hasAnimation) {
                this._overlaySettings.positionStrategy.settings.openAnimation = null;
                this._overlaySettings.positionStrategy.settings.closeAnimation = null;
            }
        }
        this.igxDropDown.toggle(this._overlaySettings);
    }

    public ngOnInit(): void {
        this.igxDrag.element.nativeElement.style.left = '300px';
        this.igxDrag.element.nativeElement.style.top = '300px';
    }

    public onDragEnd(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const wrapperElement = document.getElementsByClassName('sample-wrapper')[0];
        const wrapperElementRect = wrapperElement.getBoundingClientRect();
        const left = originalEvent.clientX - wrapperElementRect.left - this.xAddition;
        const top = originalEvent.clientY - wrapperElementRect.top - this.yAddition;
        this.igxDrag.element.nativeElement.style.left = `${Math.max(0, left)}px`;
        this.igxDrag.element.nativeElement.style.top = `${Math.max(0, top)}px`;
    }

    public onDragStart(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const buttonRect = (originalEvent.target as HTMLElement).getBoundingClientRect();
        this.xAddition = originalEvent.clientX - buttonRect.left;
        this.yAddition = originalEvent.clientY - buttonRect.top;
    }

    private removeSelectedClass(type: string) {
        const items = document.getElementsByClassName(type);

        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            element.classList.remove('selected');
        }
    }
}
