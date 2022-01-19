import { Component, ViewChild } from '@angular/core';
import { IgxToastComponent, VerticalAlignment } from 'igniteui-angular';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.css'],
    templateUrl: 'toast.sample.html',
})
export class ToastSampleComponent {
    @ViewChild('toast')
    public toast: IgxToastComponent;
    public position = VerticalAlignment;

    public showToast(toast: IgxToastComponent, pos: VerticalAlignment) {
        toast.positionSettings.verticalDirection = pos;
        toast.open();
    }

    public handleShowing(event) {
        console.log('showing toast', event);
    }

    public handleShown(event) {
        console.log('toast shown', event);
    }

    public handleHiding(event) {
        console.log('hiding toast', event);
    }

    public handleHidden(event) {
        console.log('toast hidden', event);
    }
}
