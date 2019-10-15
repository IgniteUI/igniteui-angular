import { Component } from '@angular/core';
import { SliderType, ISliderValueChangeEventArgs, IRangeSliderValue } from 'igniteui-angular';

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
    private _lowerValue: Date;
    private _upperValue: Date;

    public sliderType: SliderType = SliderType.RANGE;
    public labels = new Array<Date>();

    public rangeValue = {
        lower: 30,
        upper: 60
    };

    public rangeLabel = {
        lower: 2,
        upper: 5
    };

    constructor() {
        for (let i = 0; i <= 500; i++) {
            this.labels.push(new Date(2019, 10, i));
        }

        this._lowerValue = this.labels[0];
        this._upperValue = this.labels[this.labels.length - 1];
    }

    public get getLowerVal() {
        return `${this._lowerValue.getDay()}/${this._lowerValue.getMonth()}/${this._lowerValue.getFullYear()}`;
    }

    public get getUpperVal() {
        return `${this._upperValue.getDay()}/${this._upperValue.getMonth()}/${this._upperValue.getFullYear()}`;
    }

    public valueChange(evt: ISliderValueChangeEventArgs) {
        this._lowerValue = this.labels[(evt.value as IRangeSliderValue).lower];
        this._upperValue = this.labels[(evt.value as IRangeSliderValue).upper];
    }

    task: Task = new Task('Implement new app', 30);
}
