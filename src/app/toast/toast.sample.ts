import {Component, Input} from '@angular/core';
import {IgxToastPosition} from 'igniteui-angular';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.css'],
    templateUrl: 'toast.sample.html'
})
export class ToastSampleComponent {

    @Input()
    toastPosition: IgxToastPosition = IgxToastPosition.Bottom;

    showToast(toast, position) {
        switch (position) {
            case 'middle':
                this.toastPosition = IgxToastPosition.Middle;
                break;
            case 'top':
                this.toastPosition = IgxToastPosition.Top;
                break;
            default:
                this.toastPosition = IgxToastPosition.Bottom;
        }
        toast.show();
    }
}
