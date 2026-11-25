import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IgxFlexDirective, IgxLayoutDirective } from 'igniteui-angular';

@Component({
    selector: 'app-layout-sample',
    styleUrls: ['layout.sample.scss'],
    templateUrl: 'layout.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxLayoutDirective, IgxFlexDirective]
})
export class LayoutSampleComponent { }
