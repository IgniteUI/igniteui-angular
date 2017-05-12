import { Component, NgModule } from "@angular/core";
import { IgxProgressBarModule } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "progressbar-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})

export class ProgressbarSampleComponent {

    public currentValue: number;
    public type: string;

    constructor() {
        this.currentValue = 0;
        this.generateNewProgressValues();
    }

    private generateNewProgressValues() {
        const value = this.randomIntFromInterval(this.currentValue, 100);

        this.currentValue = value;
    }

    private randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
