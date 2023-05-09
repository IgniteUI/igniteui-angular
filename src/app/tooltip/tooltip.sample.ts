import { Component, OnInit, ViewChild } from '@angular/core';
import {
    IgxTooltipTargetDirective, OverlaySettings
} from 'igniteui-angular';
import { IgxCellTemplateDirective } from '../../../projects/igniteui-angular/src/lib/grids/columns/templates.directive';
import { IgxColumnComponent } from '../../../projects/igniteui-angular/src/lib/grids/columns/column.component';
import { IgxGridComponent } from '../../../projects/igniteui-angular/src/lib/grids/grid/grid.component';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxCardComponent, IgxCardContentDirective, IgxCardActionsComponent } from '../../../projects/igniteui-angular/src/lib/card/card.component';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { IgxSliderComponent } from '../../../projects/igniteui-angular/src/lib/slider/slider.component';
import { FormsModule } from '@angular/forms';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { IgxTooltipDirective } from '../../../projects/igniteui-angular/src/lib/directives/tooltip/tooltip.directive';
import { IgxTooltipTargetDirective as IgxTooltipTargetDirective_1 } from '../../../projects/igniteui-angular/src/lib/directives/tooltip/tooltip-target.directive';
import { IgxAvatarComponent } from '../../../projects/igniteui-angular/src/lib/avatar/avatar.component';

@Component({
    selector: 'app-tooltip-sample',
    styleUrls: ['tooltip.sample.css'],
    templateUrl: 'tooltip.sample.html',
    standalone: true,
    imports: [IgxAvatarComponent, IgxTooltipTargetDirective_1, IgxTooltipDirective, IgxIconComponent, IgxSwitchComponent, FormsModule, IgxSliderComponent, IgxButtonDirective, IgxCardComponent, IgxCardContentDirective, IgxCardActionsComponent, IgxRippleDirective, IgxGridComponent, IgxColumnComponent, IgxCellTemplateDirective]
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

    public data: any[];

    constructor() {
    }

    public ngOnInit() {
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

    public showing() {
    }

    public hiding() {
    }
}
