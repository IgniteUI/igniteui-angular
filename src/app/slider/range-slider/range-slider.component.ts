import { Component } from '@angular/core';
import { IgxSliderType, IRangeSliderValue } from 'igniteui-angular';
import { IgxInputDirective } from '../../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { IgxLabelDirective } from '../../../../projects/igniteui-angular/src/lib/directives/label/label.directive';
import { IgxInputGroupComponent } from '../../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { FormsModule } from '@angular/forms';
import { IgxThumbFromTemplateDirective, IgxThumbToTemplateDirective } from '../../../../projects/igniteui-angular/src/lib/slider/slider.common';
import { IgxSliderComponent } from '../../../../projects/igniteui-angular/src/lib/slider/slider.component';

@Component({
    selector: 'app-range-slider',
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss'],
    standalone: true,
    imports: [IgxSliderComponent, IgxThumbFromTemplateDirective, IgxThumbToTemplateDirective, FormsModule, IgxInputGroupComponent, IgxLabelDirective, IgxInputDirective]
})
export class RangeSliderComponent {
    public sliderType: IgxSliderType = IgxSliderType.RANGE;

    public weekdays: IRangeSliderValue = {
        lower: 2,
        upper: 5
    };

    public weekdayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    public rangeValues: IRangeSliderValue = {
        lower: 20,
        upper: 50
    };

    constructor() { }
}
