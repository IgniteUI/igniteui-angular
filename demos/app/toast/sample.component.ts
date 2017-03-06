import {Component, Input} from "@angular/core";
import {IgxToastPosition} from "../../../src/toast/toast.component";

@Component({
    moduleId: module.id,
    selector: "toast-sample",
    templateUrl: "sample.component.html"
})
export class IgxToastSampleComponent {
    @Input()
    public toastPosition: IgxToastPosition = IgxToastPosition.Bottom;

    public onShowing(): void {
        console.log("Toast is showing!")
    }
}