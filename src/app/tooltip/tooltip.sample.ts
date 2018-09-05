import { Component, Input, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IgxTooltipActionDirective, OverlaySettings, AutoPositionStrategy } from 'projects/igniteui-angular/src/public_api';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html'
})
export class TooltipSampleComponent implements OnInit, AfterViewInit {

    @ViewChild("button") public tooltipAction: IgxTooltipActionDirective;

    settings: OverlaySettings = {        
        positionStrategy: new AutoPositionStrategy(),
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
        this.settings.positionStrategy.settings.target = this.tooltipAction.nativeElement;
        this.settings.positionStrategy.settings.openAnimation = null;
        this.settings.positionStrategy.settings.closeAnimation = null;
    }

    showTooltip() {
        this.tooltipAction.openTooltip();
    }

    hideTooltip() {
        this.tooltipAction.closeTooltip();
    }

    opening() { console.log("opening" + " collapsed:" + this.tooltipAction.tooltipHidden); }
    opened() { console.log("opened" + " collapsed:" + this.tooltipAction.tooltipHidden); }
    closing() { console.log("closing" + " collapsed:" + this.tooltipAction.tooltipHidden); }
    closed() { console.log("closed" + " collapsed:" + this.tooltipAction.tooltipHidden); }
}
