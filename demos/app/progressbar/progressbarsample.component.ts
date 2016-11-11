import { Component, NgModule } from "@angular/core";
import { IgxProgressBarModule } from "../../../src/main";

@Component({
    selector: "progressbar-sample",
    template: `
        <button type="button" class="btn btn-sm btn-default" (click)="generateNewProgressValues()">Generate New Values</button>
        <div class="progress-container-linear">
            <igx-linear-bar [striped]="false" [value]="currentValue" [max]="200">
            </igx-linear-bar>
        </div>
        <div class="progress-container-linear">
            <igx-linear-bar type="danger" [striped]="false" [value]="currentValue">
            </igx-linear-bar>
        </div>
        <div class="progress-container-linear">
            <igx-linear-bar type="warning" [value]="20">
            </igx-linear-bar>
        </div>
        <div class="progress-container-linear">
            <igx-linear-bar type="info" [striped]="false" [value]="currentValue">
            </igx-linear-bar>
        </div>
        <div class="progress-container-linear">
            <igx-linear-bar type="success" striped="true"[value]="currentValue">
            </igx-linear-bar>
        </div>
        <div class="progress-container-linear">
            <igx-linear-bar [striped]="true" [max]="100" (onProgressChanged)="change($event)" [value]="currentValue">
            </igx-linear-bar>
        </div>
        <div class="progress-container-circular">
            <igx-circular-bar (onProgressChanged)="f($event)" [value]="currentValue"></igx-circular-bar>
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