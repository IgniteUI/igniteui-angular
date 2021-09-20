import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { IgxLinearProgressBarComponent, IgxTextAlign } from 'igniteui-angular';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-progressbar-sample',
    styleUrls: ['progressbar.sample.scss'],
    templateUrl: 'progressbar.sample.html'
})

export class ProgressbarSampleComponent implements OnInit {
    public positionCenter: IgxTextAlign;
    public positionEnd: IgxTextAlign;
    public currentValue: number;p;
    public type: string;
    public dynamicCurrentValue = 10;
    public max = 100;

    @ViewChild('progressbar')
    public progressbar: IgxLinearProgressBarComponent;

    constructor() {
        this.currentValue = 0;
        this.generateNewProgressValues();
    }
    public generateNewProgressValues() {
        const value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    public randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);

    }

    public ngOnInit() {
        this.positionCenter = IgxTextAlign.CENTER;
        this.positionEnd = IgxTextAlign.END;
    }

    public incrementProgress() {
        this.progressbar.value += 10;
    }

    public decrementProgress() {
        this.progressbar.value -= 10;
    }

    public incrementMax() {
        this.progressbar.max += 10;
    }

    public decrementMax() {
        this.progressbar.max -= 10;
    }
}
