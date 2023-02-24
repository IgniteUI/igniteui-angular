import { Component } from '@angular/core';
import { IgxLayoutDirective, IgxFlexDirective } from '../../../projects/igniteui-angular/src/lib/directives/layout/layout.directive';

@Component({
    selector: 'app-layout-sample',
    styleUrls: ['layout.sample.css'],
    templateUrl: 'layout.sample.html',
    standalone: true,
    imports: [IgxLayoutDirective, IgxFlexDirective]
})
export class LayoutSampleComponent { }
