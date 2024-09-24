import { Component } from '@angular/core';
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxRippleDirective, IgxToastComponent } from 'igniteui-angular';
import { defineComponents, IgcToastComponent } from 'igniteui-webcomponents';

defineComponents(IgcToastComponent);

@Component({
    selector: 'app-toast-showcase-sample',
    styleUrls: ['toast-showcase.sample.scss'],
    templateUrl: 'toast-showcase.sample.html',
    standalone: true,
    imports: [IgxButtonDirective, IgxRippleDirective, IgxOverlayOutletDirective, IgxToastComponent]
})
export class ToastShowcaseSampleComponent {}
