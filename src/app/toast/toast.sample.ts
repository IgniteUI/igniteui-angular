import { Component } from '@angular/core';
import { IgxToastComponent, IgxToastPosition } from 'igniteui-angular';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.css'],
    templateUrl: 'toast.sample.html',
})
export class ToastSampleComponent {
    showToast(toast: IgxToastComponent, pos: IgxToastPosition) {
        toast.position = pos;
        toast.show();
    }
}
