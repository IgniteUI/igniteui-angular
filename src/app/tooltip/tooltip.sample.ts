import { Component, Input, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IgxToggleActionDirective, IgxTooltipDirective, OverlaySettings, ConnectedPositioningStrategy, IgxToggleDirective, GlobalPositionStrategy } from 'projects/igniteui-angular/src/public_api';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html'
})
export class TooltipSampleComponent implements OnInit, AfterViewInit {

    // @ViewChild('ref')
    // public toggle: IgxToggleDirective;



    @ViewChild("button") public tooltip: IgxTooltipDirective;
    @ViewChild("buttonAction") public action: IgxToggleActionDirective;

    settings: OverlaySettings = {        
        positionStrategy: new ConnectedPositioningStrategy(),
        closeOnOutsideClick: false,
        modal: false
    };

    cellsettings: OverlaySettings = {                
        closeOnOutsideClick: false,
        modal: false
    };

    public data: any[];

    constructor() {
        
    }

    ngOnInit() {
        this.data = [
            { Name: "John", LastName: "Doe", Age: 29 },
            { Name: "Jane", LastName: "Doe", Age: 25 },
            { Name: "Nick", LastName: "Rogers", Age: 54 },
            { Name: "Samantha", LastName: "Black", Age: 33 },
            { Name: "Nicole", LastName: "Donovan", Age: 30 }
          ];
    }

    ngAfterViewInit() {
        this.settings.positionStrategy.settings.target = this.tooltip.nativeElement;
        this.settings.positionStrategy.settings.openAnimation = null;
        this.settings.positionStrategy.settings.closeAnimation = null;

        // this.action.overlaySettings = this.settings;
        // this.tooltip.overlaySettings = this.settings;
    }

    showTooltip() {

        // this.settings.positionStrategy.settings.target = this.tooltip.nativeElement;

        // this.toggle.open(settings);

        // this.tooltip.overlaySettings = this.settings;
        this.tooltip.open();
    }

    hideTooltip() {
        // this.toggle.close();
        this.tooltip.close();
    }

    test() {
        this.action.onClick();
    }
}
