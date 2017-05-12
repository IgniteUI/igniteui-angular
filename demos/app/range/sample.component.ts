import {Component, Input} from "@angular/core";
import {SliderType} from "../../../src/range/range.component";

@Component({
    moduleId: module.id,
    selector: "range-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class IgxRangeSampleComponent {
    public sliderType: SliderType = SliderType.DOUBLE_HORIZONTAL;

    private task: Task = new Task("Implement new app", 30);

    public changeValue(value: string) {
        const numberValue: number = parseFloat(value);

        if (isNaN(numberValue)) {
            return;
        }
    }
}

class Task {
    public title: string;
    public percentCompleted: number;

    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }
}
