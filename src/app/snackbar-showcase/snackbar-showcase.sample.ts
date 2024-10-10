import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
// eslint-disable-next-line max-len
import { IgxButtonDirective, IgxOverlayOutletDirective, IgxSnackbarComponent } from 'igniteui-angular';
import { defineComponents, IgcSnackbarComponent } from 'igniteui-webcomponents';

defineComponents(IgcSnackbarComponent);

@Component({
    selector: 'app-snackbar-showcase-sample',
    styleUrls: ['snackbar-showcase.sample.css'],
    templateUrl: 'snackbar-showcase.sample.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    standalone: true,
    imports: [IgxSnackbarComponent, IgxOverlayOutletDirective, IgxButtonDirective]
})
export class SnackbarShowcaseSampleComponent {
    @ViewChild('snackbar')
    private snackbar: IgxSnackbarComponent;

    public color: string;
    public actionName: string;

    public toggleSnackbar() {
        this.snackbar.toggle();
    }
}
