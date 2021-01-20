import { Component, ViewChild } from '@angular/core';
import { IgxToastComponent, IgxToastPosition } from 'igniteui-angular';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.css'],
    templateUrl: 'toast.sample.html',
})
export class ToastSampleComponent {
    @ViewChild('toast')
    public toast: IgxToastComponent;

    public toastVisibility = false;

    showToast(toast: IgxToastComponent, pos: IgxToastPosition) {
        toast.position = pos;
        toast.open();
    }

    handleShowing(event) {
        console.log('showing toast', event);
    }

    handleShown(event) {
        console.log('toast shown', event);

    }

    handleHiding(event) {
        console.log('hiding toast', event);
    }

    handleHidden(event) {
        console.log('toast hidden', event);
    }
}
