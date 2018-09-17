import { Component } from '@angular/core';

@Component({
    selector: 'app-progressbar-sample',
    styleUrls: ['progressbar.sample.css'],
    templateUrl: 'progressbar.sample.html'
})

export class ProgressbarSampleComponent {

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
    
    getValue()
    {
        return this.currentValue;
    }
}
