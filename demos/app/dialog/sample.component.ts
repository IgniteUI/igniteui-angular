import { Component, OnInit } from "@angular/core";
import { DialogModule, Dialog } from "../../../src/main";
import { IgxButtonModule } from "../../../src/main";
import { IgxInput } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "dialog-sample",
    styleUrls: ["sample.css"],
    templateUrl: "sample.html",
})
export class DialogSampleComponent implements OnInit {
    ngOnInit() {

    }

    onDialogOKSelected(args) {
        // args.event - event
        // args.dialog - dialog

        // perform OK action
        args.dialog.close();
    };
}