import { Component, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, TemplateRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyChangeService } from '../properties-panel/property-change.service';
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
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSwitchComponent,
    IgxInputGroupComponent,
    IgxInputDirective,
    IgxLabelDirective,
    IgxButtonDirective,
    IgxRippleDirective,
    IgxDropDownItemComponent,
    IChangeCheckboxEventArgs,
    IgxToggleDirective,
    IgxButtonGroupComponent,
    IButtonGroupEventArgs
} from 'igniteui-angular';
import { IAnimationParams } from 'igniteui-angular/animations';

@Component({
    selector: 'overlay-sample',
    styleUrls: ['overlay.sample.css'],
    templateUrl: './overlay.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxSelectComponent, IgxSelectItemComponent, FormsModule, IgxSwitchComponent, IgxInputGroupComponent, IgxInputDirective, IgxLabelDirective, IgxButtonDirective, IgxRippleDirective, IgxDragDirective, IgxDropDownComponent, IgxDropDownItemComponent, IgxToggleDirective, IgxButtonGroupComponent]
})
export class OverlaySampleComponent implements AfterViewInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild(IgxDragDirective, { static: true })
    private igxDrag: IgxDragDirective;
    @ViewChild('container', { static: true })
    private container: ElementRef;
    @ViewChild('containerTarget', { static: true, read: IgxToggleDirective })
    private containerTarget: IgxToggleDirective;
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');
    private readonly stageEl = viewChild.required<ElementRef>('stage');
    private readonly propertyChangeService = inject(PropertyChangeService);

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
    public useContainer = false;
    public hasAnimation = true;
    public changeContainer = false;
    public animationLength = 300; // in ms
    public nudgeSteps = [1, 10, 100];
    public nudgeStep = 1;

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

    public onPositionStrategyChange(value: string): void {
        switch (value) {
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
            case 'Container':
                this._overlaySettings.positionStrategy = new ContainerPositionStrategy();
                this.horizontalDirection = 'Center';
                this.verticalDirection = 'Middle';
                this.horizontalStartPoint = 'Center';
                this.verticalStartPoint = 'Middle';
                this.closeOnOutsideClick = true;
                this.modal = true;
                this.useContainer = true;
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
                break;
            default:
                break;
        }
    }

    public onScrollStrategyChange(value: string): void {
        switch (value) {
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
    }

    public onSwitchChange(ev: IChangeCheckboxEventArgs) {
        switch (ev.owner.name) {
            case 'close':
                this._overlaySettings.closeOnOutsideClick = ev.checked;
                break;
            case 'modal':
                this._overlaySettings.modal = ev.checked;
                break;
            case 'container':
                break;
            case 'changeContainer':
                if (ev.checked) {
                    this.container.nativeElement.style.position = 'fixed';
                    this.container.nativeElement.style.width = '600px';
                    this.container.nativeElement.style.height = '400px';
                    this.container.nativeElement.style.border = '1px solid red';
                    this.container.nativeElement.style.top = '50px';
                    this.container.nativeElement.style.left = '50px';
                } else {
                    this.container.nativeElement.style.position = 'static';
                    this.container.nativeElement.style.width = 'unset';
                    this.container.nativeElement.style.height = 'unset';
                    this.container.nativeElement.style.border = '0';
                    this.container.nativeElement.style.top = 'unset';
                    this.container.nativeElement.style.left = 'unset';
                }
                break;
        }
    }

    public setDirection(vertical: string, horizontal: string): void {
        this.verticalDirection = vertical;
        this.horizontalDirection = horizontal;
    }

    public setStartPoint(vertical: string, horizontal: string): void {
        this.verticalStartPoint = vertical;
        this.horizontalStartPoint = horizontal;
    }

    public onNudgeStepChange(ev: IButtonGroupEventArgs): void {
        this.nudgeStep = this.nudgeSteps[ev.index];
    }

    public toggle() {
        if (this.igxDropDown.collapsed) {
            if (this.positionStrategy !== 'Container' && this.positionStrategy !== 'Global') {
                this.items = [];
                for (let item = 0; item < this.itemsCount; item++) {
                    this.items.push(`Item ${item}`);
                }
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
        if (this.positionStrategy === 'Container' || this.positionStrategy === 'Global') {
            this.containerTarget.toggle(this._overlaySettings);
        } else {
            this.igxDropDown.toggle(this._overlaySettings);
        }
    }

    public ngAfterViewInit(): void {
        this.propertyChangeService.setCustomControls(this.customControlsTemplate());
        this.propertyChangeService.setPanelTitle('Overlay Settings');
        this.centerToggleButton();
    }

    public onDragEnd(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const stageRect = this.stageEl().nativeElement.getBoundingClientRect();
        const left = originalEvent.clientX - stageRect.left - this.xAddition;
        const top = originalEvent.clientY - stageRect.top - this.yAddition;
        this.igxDrag.element.nativeElement.style.left = `${Math.max(0, left)}px`;
        this.igxDrag.element.nativeElement.style.top = `${Math.max(0, top)}px`;
    }

    public onDragStart(e) {
        const originalEvent: PointerEvent = e.originalEvent;
        const buttonRect = (originalEvent.target as HTMLElement).getBoundingClientRect();
        this.xAddition = originalEvent.clientX - buttonRect.left;
        this.yAddition = originalEvent.clientY - buttonRect.top;
    }

    private centerToggleButton(): void {
        const stageRect = this.stageEl().nativeElement.getBoundingClientRect();
        const buttonRect = this.igxDrag.element.nativeElement.getBoundingClientRect();
        this.igxDrag.element.nativeElement.style.left = `${(stageRect.width - buttonRect.width) / 2}px`;
        this.igxDrag.element.nativeElement.style.top = `${(stageRect.height - buttonRect.height) / 2}px`;
    }

    protected moveHost(target: HTMLElement, direction: string, distance: number): void{
        const currentTop = parseInt(target.style.top, 10) || 0;
        const currentLeft = parseInt(target.style.left, 10) || 0;

        switch (direction) {
            case 'up':
                target.style.top = `${currentTop - distance}px`;
                break;
            case 'down':
                target.style.top = `${currentTop + distance}px`;
                break;
            case 'left':
                target.style.left = `${currentLeft - distance}px`;
                break;
            case 'right':
                target.style.left = `${currentLeft + distance}px`;
                break;
        }
    }
}
