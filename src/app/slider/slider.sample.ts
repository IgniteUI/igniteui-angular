import { Component } from '@angular/core';
import { IgxSliderType, ISliderValueChangeEventArgs, IRangeSliderValue, TickLabelsOrientation, TicksOrientation } from 'igniteui-angular';

class Task {
    public title: string;
    public percentCompleted: number;

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
    public labelOrientaion: TickLabelsOrientation = TickLabelsOrientation.Horizontal;
    public ticksOrientation: TicksOrientation = TicksOrientation.Bottom;
    public primaryTickLabels = true;
    public secondaryTickLabels = true;
    public sliderType: IgxSliderType = IgxSliderType.RANGE;
    public labelsDates = new Array<Date>();
    public task: Task = new Task('Implement new app', 30);
    public labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    public rangeValue = {
        lower: 34,
        upper: 67
    };

    public rangeLabel = {
        lower: 2,
        upper: 5
    };

    private _lowerValue: Date;
    private _upperValue: Date;

    constructor() {
        for (let i = 0; i <= 500; i++) {
            this.labelsDates.push(new Date(2019, 10, i));
        }

        this._lowerValue = this.labelsDates[0];
        this._upperValue = this.labelsDates[this.labels.length - 1];
    }

    public get getLowerVal() {
        return `${this._lowerValue.getDay()}/${this._lowerValue.getMonth()}/${this._lowerValue.getFullYear()}`;
    }

    public get getUpperVal() {
        return `${this._upperValue.getDay()}/${this._upperValue.getMonth()}/${this._upperValue.getFullYear()}`;
    }

    public valueChange(evt: ISliderValueChangeEventArgs) {
        this._lowerValue = this.labelsDates[(evt.value as IRangeSliderValue).lower];
        this._upperValue = this.labelsDates[(evt.value as IRangeSliderValue).upper];
    }

    public changeLabels() {
        this.labels = new Array('08:00', '12:00', '16:00', '20:00', '00:00');
    }

    public changeLabelOrientation() {
        if (this.labelOrientaion === TickLabelsOrientation.Horizontal) {
            this.labelOrientaion = TickLabelsOrientation.TopToBottom;
        } else if (this.labelOrientaion === TickLabelsOrientation.TopToBottom) {
            this.labelOrientaion = TickLabelsOrientation.BottomToTop;
        } else {
            this.labelOrientaion = TickLabelsOrientation.Horizontal;
        }
    }

    public changeTicksOrientation() {
        if (this.ticksOrientation === TicksOrientation.Mirror) {
            this.ticksOrientation = TicksOrientation.Top;
        } else if (this.ticksOrientation === TicksOrientation.Top) {
            this.ticksOrientation = TicksOrientation.Bottom;
        } else {
            this.ticksOrientation = TicksOrientation.Mirror;
        }
    }

    public tickLabel(value, primary) {
        if (primary) {
            return Math.round(value);
        }

        return value;
    }

}
