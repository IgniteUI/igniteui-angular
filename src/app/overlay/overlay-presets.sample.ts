import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IgxDropDownComponent,
    OverlaySettings,
    IgxDragDirective,
    IgxOverlayService,
    IgxRadioComponent,
    IgxButtonDirective,
    IgxRippleDirective,
    IgxDropDownItemComponent,
    RelativePositionStrategy,
    AbsolutePosition,
    RelativePosition
} from 'igniteui-angular';

@Component({
    selector: 'overlay-presets-sample',
    templateUrl: './overlay-presets.sample.html',
    styleUrls: ['overlay-presets.sample.scss'],
    imports: [NgFor, IgxRadioComponent, FormsModule, IgxButtonDirective, IgxRippleDirective, IgxDragDirective, IgxDropDownComponent, IgxDropDownItemComponent]
})
export class OverlayPresetsSampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent, { static: true })
    private igxDropDown: IgxDropDownComponent;
    @ViewChild('button', { static: true })
    private button: ElementRef;
    @ViewChild('outlet', { static: true })
    private outletElement: ElementRef;
    @ViewChild(IgxDragDirective, { static: true })
    private igxDrag: IgxDragDirective;

    public items = [];
    public itemsCount = 10;
    public relStrategies = [RelativePositionStrategy.Auto, RelativePositionStrategy.Connected, RelativePositionStrategy.Elastic];
    public absStrategies = ['Global', 'Container'];
    public positionStrategy = 'Global';
    public absPosition: AbsolutePosition = AbsolutePosition.Center;
    public absPositions = [AbsolutePosition.Center, AbsolutePosition.Top, AbsolutePosition.Bottom];
    public relPosition: RelativePosition;
    public relPositions = [
        RelativePosition.Above,
        RelativePosition.Below,
        RelativePosition.Before,
        RelativePosition.After,
        RelativePosition.Default
    ];

    private _overlaySettings: OverlaySettings;
    private xAddition = 0;
    private yAddition = 0;

    constructor(
    ) {
        for (let item = 0; item < this.itemsCount; item++) {
            this.items.push(`Item ${item}`);
        }
    }

    public ngOnInit(): void {
        this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
    }

    public onChange() {
        switch (this.positionStrategy) {
            case RelativePositionStrategy.Auto:
            case RelativePositionStrategy.Connected:
            case RelativePositionStrategy.Elastic:
                this.absPosition = null;
                this.relPosition = this.relPosition || RelativePosition.Default;
                this._overlaySettings = IgxOverlayService.createRelativeOverlaySettings(
                    this.button.nativeElement,
                    this.relPosition,
                    this.positionStrategy);
                break;
            case 'Global':
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
                break;
            case 'Container':
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition, this.outletElement);
                break;
            default:
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings();
        }
    }

    public toggleDropDown() {
        this.igxDropDown.toggle(this._overlaySettings);
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
}
