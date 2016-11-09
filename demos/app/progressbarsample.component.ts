import { Component } from "@angular/core";
import { IgProgressBarModule } from "../../src/progressbar/progressbar.component";

@Component({
    selector: "progressbar-sample",
    template: `
        <button type="button" class="btn btn-sm btn-default" (click)="generateNewProgressValues()">Generate New Values</button>
        <div class="progress-container-linear">
            <ig-progressbar [striped]="false" [animated]="false" [value]="currentValue" [max]="200">
            </ig-progressbar>
        </div>
        <div class="progress-container-linear">
            <ig-progressbar type="danger" [striped]="false" [animated]="true" [value]="currentValue">
            </ig-progressbar>
        </div>
        <div class="progress-container-linear">
            <ig-progressbar type="warning" [animated]="true" [value]="20">-
            </ig-progressbar>
        </div>
        <div class="progress-container-linear">
            <ig-progressbar type="info" [striped]="false" [animated]="true" [value]="currentValue">
                <b>{{currentValue}}%</b>
            </ig-progressbar>
        </div>
        <div class="progress-container-linear">
            <ig-progressbar type="success" striped="true" animated="true" [value]="currentValue">
                <b>{{currentValue}}%</b>
            </ig-progressbar>
        </div>
        <div class="progress-container-linear">
            <ig-progressbar [striped]="true" [animated]="true" [value]="currentValue">
                <b>{{currentValue}}%</b>
            </ig-progressbar>
        </div>
        <div class="progress-container-circular">
            <ig-progressbar [circeler]="true" (onProgressChanged)="f($event)" [value]='currentValue'></ig-progressbar>
        </div>
    `,
    styles: [
        `.progress-container-circular {
            width: 100px;
            height: 100px;
        }
        .progress-container-linear {
            width: 50%;
            height: 50px;
        }
        `
    ]
})

export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 0;
        // this.generateNewProgressValues();
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
}