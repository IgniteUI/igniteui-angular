import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
    IgxTooltipTargetDirective, OverlaySettings,
    ITooltipShowEventArgs, ITooltipHideEventArgs,
} from 'igniteui-angular';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html'
})
export class TooltipSampleComponent implements OnInit, AfterViewInit {

    @ViewChild('target', { static: true }) public tooltipTarget: IgxTooltipTargetDirective;

    public settings: OverlaySettings = {
        // positionStrategy: new AutoPositionStrategy(),
        // scrollStrategy: new AbsoluteScrollStrategy(),
        // closeOnOutsideClick: false,
        // modal: false
    };

    public data: any[];

    constructor() {
    }

    ngOnInit() {
        this.data = [
            {
                Brand: 'Samsung',
                Model: 'Galaxy Note 9',
                Spec: {
                    Launch: '2018, August',
                    Build: 'Front/back glass',
                    Display: '6.4\'\', Super AMOLED',
                    Resolution: '1440 x 2960 px',
                    OS: 'Android 8.1 (Oreo)',
                    Battery: 'Li-Ion 4000 mAh'
                }
            },
            {
                Brand: 'Google', Model: 'Pixel 2 XL',
                Spec: {
                    Launch: '2017, October',
                    Build: 'Front glass, partial glass back',
                    Display: '6.0\'\', P-OLED',
                    Resolution: '1440 x 2880 px',
                    OS: 'Android 8.0 (Oreo)',
                    Battery: 'Li-Ion 3520 mAh'
                }
            },
            {
                Brand: 'Apple', Model: 'iPhone XS Max',
                Spec: {
                    Launch: '2018, September',
                    Build: 'Front/back glass',
                    Display: '6.5\'\', Super Retina',
                    Resolution: '1242 x 2688 px',
                    OS: 'iOS 12',
                    Battery: 'N/A'
                }
            },
            {
                Brand: 'LG', Model: 'G7 ThinQ',
                Spec: {
                    Launch: '2018, May',
                    Build: 'Front/back glass',
                    Display: '6.1\'\', IPS LCD',
                    Resolution: '1440 x 3120 px',
                    OS: 'Android 8.0 (Oreo)',
                    Battery: 'Li-Po 3000 mAh'
                }
            },
            {
                Brand: 'HTC', Model: 'U12+',
                Spec: {
                    Launch: '2018, May',
                    Build: 'Front/back glass',
                    Display: '6.0\'\', Super LCD6',
                    Resolution: '1440 x 2880 px',
                    OS: 'Android 8.0 (Oreo)',
                    Battery: 'Li-Ion 3500 mAh'
                }
            }
        ];
    }

    ngAfterViewInit() {
        // this.settings.positionStrategy.settings.target = this.tooltipTarget.nativeElement;
        // this.settings.positionStrategy.settings.openAnimation = null;
        // this.settings.positionStrategy.settings.closeAnimation = null;
    }

    showTooltip() {
        this.tooltipTarget.showTooltip();
    }

    hideTooltip() {
        this.tooltipTarget.hideTooltip();
    }

    showing(args: ITooltipShowEventArgs) {
    }

    hiding(args: ITooltipHideEventArgs) {
    }
}
