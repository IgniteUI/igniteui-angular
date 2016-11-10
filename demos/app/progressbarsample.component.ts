import { Component } from "@angular/core";
import { IgProgressBarModule } from "../../src/progressbar/progressbar.component";

@Component({
    selector: "progressbar-sample",
    template: `
        <button type="button" class="btn btn-sm btn-default" (click)="generateNewProgressValues()">Generate New Values</button>
        <div class="progress-container-linear">
            <ig-linear-bar [striped]="false" [animated]="false" [value]="currentValue" [max]="200">
            </ig-linear-bar>
        </div>
        <div class="progress-container-linear">
            <ig-linear-bar type="danger" [striped]="false" [animated]="true" [value]="currentValue">
            </ig-linear-bar>
        </div>
        <div class="progress-container-linear">
            <ig-linear-bar type="warning" [animated]="true" [value]="20">
            </ig-linear-bar>
        </div>
        <div class="progress-container-linear">
            <ig-linear-bar type="info" [striped]="false" [animated]="true" [value]="currentValue">
            </ig-linear-bar>
        </div>
        <div class="progress-container-linear">
            <ig-linear-bar type="success" striped="true" animated="true" [value]="currentValue">
            </ig-linear-bar>
        </div>
        <div class="progress-container-linear">
            <ig-linear-bar [striped]="true" [max]="200" (onProgressChanged)="change($event)" [animated]="true" [value]="currentValue">
            </ig-linear-bar>
        </div>
        <div class="progress-container-circular">
            <ig-circular-bar [max]="200" (onProgressChanged)="f($event)" [value]="currentValue"></ig-circular-bar>
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

    change(evt) {
        console.log(evt);
    }
}