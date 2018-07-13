import { Component } from '@angular/core';

@Component({
    selector: 'app-dialog-sample',
    styleUrls: ['dialog.sample.css'],
    templateUrl: 'dialog.sample.html'
})
export class DialogSampleComponent {

    onDialogOKSelected(args) {
        // args.event - event
        // args.dialog - dialog

        // perform OK action
        args.dialog.close();
    }

    public closeDialog(evt) {
        console.log(evt);
    }
}
