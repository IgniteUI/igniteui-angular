import { Component } from "@angular/core";

@Component({
    selector: "datePicker-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "sample.component.html"
})
export class IgxDatePickerSampleComponent {
    public date: Date = new Date(Date.now());

    public formatter = (_: Date) => {
        return _.toDateString();
    }
}
