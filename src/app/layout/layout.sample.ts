import { Component } from '@angular/core';
import { IgxFlexDirective, IgxLayoutDirective } from 'igniteui-angular';

@Component({
    selector: 'app-layout-sample',
    styleUrls: ['layout.sample.scss'],
    templateUrl: 'layout.sample.html',
    standalone: true,
    imports: [IgxLayoutDirective, IgxFlexDirective]
})
export class LayoutSampleComponent { }
