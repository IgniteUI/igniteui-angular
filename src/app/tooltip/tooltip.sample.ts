import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    IgxAvatarComponent,
    IgxButtonDirective,
    IgxCardActionsComponent,
    IgxCardComponent,
    IgxCardContentDirective,
    IgxCellTemplateDirective,
    IgxColumnComponent,
    IgxGridComponent,
    IgxIconButtonDirective,
    IgxIconComponent,
    IgxRippleDirective,
    IgxSelectComponent,
    IgxSelectItemComponent,
    IgxSliderComponent,
    IgxSwitchComponent,
    IgxTooltipDirective,
    IgxTooltipTargetDirective,
    ISelectionEventArgs,
    OverlaySettings,
    Placement,
} from 'igniteui-angular';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html',
    imports: [IgxAvatarComponent, IgxTooltipTargetDirective, IgxTooltipDirective, IgxIconComponent, IgxIconButtonDirective, IgxSwitchComponent, FormsModule, IgxSliderComponent, IgxButtonDirective, IgxCardComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxRippleDirective, IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective, IgxSelectComponent, IgxSelectItemComponent]
})
export class TooltipSampleComponent implements OnInit {

    @ViewChild('target', { static: true })
    public tooltipTarget: IgxTooltipTargetDirective;

    public settings: OverlaySettings = {
        // positionStrategy: new AutoPositionStrategy(),
        // scrollStrategy: new AbsoluteScrollStrategy(),
        // closeOnOutsideClick: false,
        // modal: false
    };

    public placementPositions = [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'right',
        'right-start',
        'right-end',
        'left',
        'left-start',
        'left-end',
    ];

    public data: any[];

    constructor() {
    }

    public ngOnInit() {
        this.tooltipTarget.positionSettings = {
            placement: Placement.Bottom,
        };

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

    public showTooltip() {
        this.tooltipTarget.showTooltip();
    }

    public hideTooltip() {
        this.tooltipTarget.hideTooltip();
    }

    public setPlacement(args: ISelectionEventArgs) {
        const placement: Placement = args.newSelection.value;

        this.tooltipTarget.positionSettings = {
            placement: placement,
        };
    }
}
