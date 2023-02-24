import { Component, ViewChild } from '@angular/core';
import { IgxToastComponent, VerticalAlignment } from 'igniteui-angular';
import { IgxToastComponent as IgxToastComponent_1 } from '../../../projects/igniteui-angular/src/lib/toast/toast.component';
import { IgxOverlayOutletDirective } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';

@Component({
    selector: 'app-toast-sample',
    styleUrls: ['toast.sample.css'],
    templateUrl: 'toast.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxOverlayOutletDirective, IgxToastComponent_1]
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
