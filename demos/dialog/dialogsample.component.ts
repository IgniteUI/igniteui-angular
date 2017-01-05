import { Component } from "@angular/core";
import { IgxDialogModule } from "igniteui-js-blocks/main";

@Component({
    selector: "dialog-sample",
    templateUrl: "demos/dialog/dialogsample.component.html",
})
export class DialogSampleComponent {
    onDialogOKSelected(args) {
        args.dialog.close();
    };
}