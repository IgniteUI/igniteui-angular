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
    ElasticPositionStrategy,
    IgxDragDirective,
    ContainerPositionStrategy,
    IgxOverlayService
} from 'igniteui-angular';
import { RelativePositionStrategy, AbsolutePosition, RelativePosition } from 'projects/igniteui-angular/src/lib/services/overlay/utilities';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'overlay-presets-sample',
    templateUrl: './overlay-presets.sample.html',
    styleUrls: ['overlay-presets.sample.scss']
})
export class OverlayPresetsSampleComponent implements OnInit {
    @ViewChild(IgxDropDownComponent, { static: true }) public igxDropDown: IgxDropDownComponent;
    @ViewChild('button', { static: true }) public button: ElementRef;
    @ViewChild('outlet', { static: true }) public outletElement: ElementRef;

    items = [];
    itemsCount = 10;
    private _overlaySettings: OverlaySettings;
    relStrategies = ['Auto', 'Connected', 'Elastic'];
    absStrategies = ['Global', 'Container'];
    positionStrategy = 'Global';
    absPosition: AbsolutePosition = AbsolutePosition.Center;
    absPositions = [AbsolutePosition.Center, AbsolutePosition.TopCenter, AbsolutePosition.BottomCenter];
    relPosition: RelativePosition = RelativePosition.Below;
    relPositions = [
        RelativePosition.Above,
        RelativePosition.Below,
        RelativePosition.Left,
        RelativePosition.Right,
        RelativePosition.Default];
    outlet;

    constructor(
        private cdr: ChangeDetectorRef
    ) {
        for (let item = 0; item < this.itemsCount; item++) {
            this.items.push(`Item ${item}`);
        }
    }

    ngOnInit(): void {
        this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
        this.outlet = this.outletElement.nativeElement;
    }

    onChange(ev) {
        switch (this.positionStrategy) {
            case 'Auto':
            case 'Connected':
            case 'Elastic':
                this.absPosition = null;
                this._overlaySettings = IgxOverlayService.createRelativeOverlaySettings(
                    this.button.nativeElement,
                    RelativePositionStrategy[this.positionStrategy],
                    this.relPosition);
                break;
            case 'Global':
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition);
                break;
            case 'Container':
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings(this.absPosition, this.outlet);
                break;
            default:
                this.relPosition = null;
                this._overlaySettings = IgxOverlayService.createAbsoluteOverlaySettings();
        }
    }

    public toggleDropDown() {
        this.igxDropDown.toggle(this._overlaySettings);
    }
}
