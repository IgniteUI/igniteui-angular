import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IgxGridColumnResizerComponent } from '../resizer.component';
import { IgxPivotColumnResizingService } from './pivot-resizing.service';
import { IgxColumnResizerDirective } from '../resizer.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-grid-column-resizer',
    templateUrl: '../resizer.component.html',
    standalone: true,
    imports: [IgxColumnResizerDirective]
})
export class IgxPivotGridColumnResizerComponent extends IgxGridColumnResizerComponent {
    constructor(public colResizingService: IgxPivotColumnResizingService) {
        super(colResizingService);
    }
}
