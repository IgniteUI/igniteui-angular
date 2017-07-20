import {Component} from "@angular/core";
import {SliderType} from "../../../src/slider/slider.component";

@Component({
    moduleId: module.id,
    selector: "slider-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "./sample.component.html"
})
export class IgxSliderSampleComponent {
    public sliderType: SliderType = SliderType.RANGE;

    public rangeValue = {
        lower: 30,
        upper: 60
    };

    private task: Task = new Task("Implement new app", 30);
}

class Task {
    public title: string;
    public percentCompleted: number;

    constructor(title: string, percentCompeted: number) {
        this.title = title;
        this.percentCompleted = percentCompeted;
    }
}