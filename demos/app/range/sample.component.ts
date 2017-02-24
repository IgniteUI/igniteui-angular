import {Component, Input} from "@angular/core";
import {SliderType} from "../../../src/range/range.component";

@Component({
    moduleId: module.id,
    selector: "range-sample",
    templateUrl: "./sample.component.html"
})
export class IgxRangeSampleComponent {

    private task: Task = new Task("Implement new app", 30);

    public changeValue(value: string) {
        var numberValue: number = parseFloat(value);

        if(numberValue === NaN) {
            return;
        }
    }

    public sliderType: SliderType = SliderType.DOUBLE_HORIZONTAL;
}

class Task {
    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }

    public title: string;

    public percentCompleted: number;
}