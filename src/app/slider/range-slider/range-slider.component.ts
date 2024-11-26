import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxSliderComponent, IgxSliderType, IgxThumbFromTemplateDirective, IgxThumbToTemplateDirective, IRangeSliderValue } from 'igniteui-angular';

@Component({
    selector: 'app-range-slider',
    templateUrl: './range-slider.component.html',
    styleUrls: ['./range-slider.component.scss'],
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
