import { Component, OnInit } from "@angular/core";
import { ModalModule, Modal } from "../../../src/main";
import { ButtonModule } from "../../../src/main";
import { IgInput } from "../../../src/main";

@Component({
    moduleId: module.id,
    selector: "modal-sample",
    styleUrls: ["sample.css"],
    templateUrl: "sample.html",
})
export class ModalSampleComponent implements OnInit {
    ngOnInit() {

    }

    onDialogOKSelected(args) {
        // args.event - event
        // args.modal - modal

        // perform OK action
        args.modal.close();
    };
}