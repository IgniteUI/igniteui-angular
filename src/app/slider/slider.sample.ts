import { Component } from '@angular/core';
import { SliderType, TickLabelsOrientation } from 'igniteui-angular';

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
    labelOrientaion = TickLabelsOrientation.vertical;

    rangeValue = {
        lower: 30,
        upper: 60
    };

    rangeLabel = {
        lower: 2,
        upper: 5
    };

    changeLabelOrientation() {
        if (this.labelOrientaion === TickLabelsOrientation.vertical) {
            this.labelOrientaion = TickLabelsOrientation.horizontal;
        } else {
            this.labelOrientaion = TickLabelsOrientation.vertical;
        };
    }

    task: Task = new Task('Implement new app', 30);
}
