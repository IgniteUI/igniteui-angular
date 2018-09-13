import { Component, Input, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import {
    IgxTooltipTargetDirective, OverlaySettings, AutoPositionStrategy,
    ITooltipOpeningEventArgs, ITooltipOpenedEventArgs, ITooltipClosingEventArgs, ITooltipClosedEventArgs
} from 'igniteui-angular';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html'
})
export class TooltipSampleComponent implements OnInit, AfterViewInit {

    @ViewChild("button") public tooltipTarget: IgxTooltipTargetDirective;

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
        this.settings.positionStrategy.settings.target = this.tooltipTarget.nativeElement;
        // this.settings.positionStrategy.settings.openAnimation = null;
        // this.settings.positionStrategy.settings.closeAnimation = null;
    }

    showTooltip() {
        this.tooltipTarget.openTooltip();
    }

    hideTooltip() {
        this.tooltipTarget.closeTooltip();
    }

    opening(args: ITooltipOpeningEventArgs) { console.log("opening"); }
    opened(args: ITooltipOpenedEventArgs) { console.log("opened"); }
    closing(args: ITooltipClosingEventArgs) { console.log("closing"); }
    closed(args: ITooltipClosedEventArgs) { console.log("closed"); }
}
