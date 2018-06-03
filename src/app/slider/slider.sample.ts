import { Component } from '@angular/core';
import { SliderType } from 'igniteui-angular';

@Component({
    selector: 'app-slider-sample',
    templateUrl: 'slider.sample.html'
})
export class SliderSampleComponent {
    sliderType: SliderType = SliderType.RANGE;

    rangeValue = {
        lower: 30,
        upper: 60
    };

    task: Task = new Task('Implement new app', 30);
}

class Task {
    title: string;
    percentCompleted: number;

    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }
}
