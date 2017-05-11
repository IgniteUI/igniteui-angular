import { Component } from '@angular/core';
import { IgxProgressBarModule } from 'igniteui-js-blocks/main';

@Component({
    selector: 'progressbar-sample',
    templateUrl: 'demos/progressbar/progressbar.component.html'
})
export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 26;
    }

    private generateNewProgressValues() {
        let value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    private randomIntFromInterval(min:number,max:number)
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    f(evt) {
        console.log(evt);
    }

    change(evt) {
        console.log(evt);
    }
}
