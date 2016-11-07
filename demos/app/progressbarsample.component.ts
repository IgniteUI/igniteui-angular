import { Component } from "@angular/core";
import { IgProgressBarModule } from "../../src/progressbar/progressbar.component";

@Component({
    selector: "progressbar-sample",
    template: `
        <button type="button" class="btn btn-sm btn-default" (click)="generateNewProgressValues()">Generate New Values</button>
        <ig-progressbar [striped]="false" [animated]="false" [value]="currentValue" [max]="200">
        </ig-progressbar>
        <ig-progressbar type="danger" [striped]="false" [animated]="true" [value]="currentValue">
        </ig-progressbar>
        <ig-progressbar type="warning" [value]="20">
        </ig-progressbar>
        <ig-progressbar type="info" [striped]="false" [animated]="true" [value]="currentValue">
            <b>{{currentValue}}%</b>
        </ig-progressbar>
        <ig-progressbar type="success" striped="true" animated="true" value="currentValue">
            <b>{{currentValue}}%</b>
        </ig-progressbar>
        <ig-progressbar [striped]="true" [animated]="true" [value]="currentValue">
            <b>{{currentValue}}%</b>
        </ig-progressbar>
        <ig-progressbar [value]="currentValue" data-percent="currentValue" [circeler]="true"></ig-progressbar>
    `,
})

export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.generateNewProgressValues();
    }

    private generateNewProgressValues() {
        let value = Math.floor((Math.random() * 100) + 1);

        this.currentValue = value;
    }
}