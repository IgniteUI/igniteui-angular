import { Component, ViewChild } from '@angular/core';
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxRippleDirective, IgxToastComponent, VerticalAlignment } from 'igniteui-angular';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.scss'],
    templateUrl: 'toast.sample.html',
    imports: [IgxButtonDirective, IgxRippleDirective, IgxOverlayOutletDirective, IgxToastComponent]
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
