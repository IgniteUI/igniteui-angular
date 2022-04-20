import { Component } from '@angular/core';
import { IRangeSliderValue } from 'igniteui-angular';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss']
})
export class RangeSliderComponent {

    public rangeValue: IRangeSliderValue = {
        lower: 2,
        upper: 5
    };

    constructor() { }

}
