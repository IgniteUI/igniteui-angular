import { Component, ChangeDetectionStrategy } from '@angular/core';
import {IgxLabelDirective} from "igniteui-angular";

@Component({
    selector: 'app-label',
    imports: [IgxLabelDirective],
    templateUrl: './label.sample.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './label.sample.scss'
})
export class LabelSampleComponent {

}
