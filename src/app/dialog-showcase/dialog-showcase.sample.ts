import { Component } from '@angular/core';
import { IgxButtonDirective, IgxDialogActionsDirective, IgxDialogComponent, IgxDialogTitleDirective, IgxIconComponent, IgxInputDirective, IgxInputGroupComponent, IgxLabelDirective, IgxPrefixDirective, IgxRippleDirective, IgxSwitchComponent } from 'igniteui-angular';
import { defineComponents, IgcDialogComponent, IgcButtonComponent} from "igniteui-webcomponents";

defineComponents(IgcDialogComponent, IgcButtonComponent);

@Component({
    selector: 'app-dialog-showcase-sample',
    styleUrls: ['dialog-showcase.sample.scss'],
    templateUrl: 'dialog-showcase.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxSwitchComponent, IgxDialogComponent, IgxInputGroupComponent, IgxPrefixDirective, IgxIconComponent, IgxInputDirective, IgxLabelDirective, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
export class DialogShowcaseSampleComponent {
    public onDialogOKSelected(args) {
        // args.event - event
        // args.dialog - dialog

        // perform OK action
        args.dialog.close();
    }

    public closeDialog(evt) {
        console.log(evt);
    }
}
