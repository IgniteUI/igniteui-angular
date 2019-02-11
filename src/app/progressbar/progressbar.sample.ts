import { Component } from '@angular/core';
import { IgxTextAlign } from 'igniteui-angular';

@Component({
    selector: 'app-progressbar-sample',
    styleUrls: ['progressbar.sample.css'],
    templateUrl: 'progressbar.sample.html'
})

export class ProgressbarSampleComponent {
    public positionCenter: IgxTextAlign;
    public positionEnd: IgxTextAlign;

    currentValue: number;
    type: string;

    constructor() {
        this.currentValue = 0;
        this.generateNewProgressValues();
    }

    generateNewProgressValues() {
        const value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public ngOnInit() {
        this.positionCenter = IgxTextAlign.CENTER;
        this.positionEnd = IgxTextAlign.END;
    }
}
