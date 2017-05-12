import {Component, Input} from "@angular/core";
import {IgxToastPosition} from "../../../src/toast/toast.component";

@Component({
    moduleId: module.id,
    selector: "toast-sample",
    styleUrls: ["../app.samples.css", "sample.component.css"],
    templateUrl: "sample.component.html"
})
export class IgxToastSampleComponent {
    @Input()
    public toastPosition: IgxToastPosition = IgxToastPosition.Bottom;

    public onShowing(): void { }

    public showToast(toast, position) {
        switch (position) {
            case "middle":
                this.toastPosition = IgxToastPosition.Middle;
                break;
            case "top":
                this.toastPosition = IgxToastPosition.Top;
                break;
            default:
                this.toastPosition = IgxToastPosition.Bottom;
        }
        toast.show();
    }
}
