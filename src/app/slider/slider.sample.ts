import { Component } from '@angular/core';
import { SliderType } from 'igniteui-angular';

class Task {
    title: string;
    percentCompleted: number;

    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }
}

@Component({
    selector: 'app-slider-sample',
    styleUrls: ['slider.sample.scss'],
    templateUrl: 'slider.sample.html'
})
export class SliderSampleComponent {
    sliderType: SliderType = SliderType.RANGE;

    rangeValue = {
        lower: 30,
        upper: 60
    };

    rangeLabel = {
        lower: 2,
        upper: 5
    };

    task: Task = new Task('Implement new app', 30);
}
