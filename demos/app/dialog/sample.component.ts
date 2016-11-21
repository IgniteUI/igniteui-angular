import { Component } from "@angular/core";

@Component({
    moduleId: module.id,
    selector: "dialog-sample",
    styleUrls: ["sample.css"],
    templateUrl: "sample.component.html",
})
export class DialogSampleComponent {
    onDialogOKSelected(args) {
        // args.event - event
        // args.dialog - dialog

        // perform OK action
        args.dialog.close();
    };
}