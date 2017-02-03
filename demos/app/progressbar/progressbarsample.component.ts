import { Component, NgModule } from "@angular/core";
import { IgxProgressBarModule } from "../../../src/main";

@Component({
    selector: "progressbar-sample",
    template: `
        <h3>Progress Bars</h3>
        <div class="button-container">
            <button igxButton="fab" igxRipple="" (click)="generateNewProgressValues()">
                <i class="material-icons">refresh</i>
            </button>
        </div>
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
            width: 150px;
            height: 150px;
            padding: 16px;
        }
        .progress-container-linear {
            width: 100%;
            height: 50px;
            padding: 16px;
        }
        .button-container {
            position: fixed;
            bottom: 0;
            right: 0;
            padding: 16px;
            z-index: 24;
        }
        `
    ]
})

export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 0;
        this.generateNewProgressValues();
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