import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IgxGridColumnResizerComponent } from '../resizer.component';
import { IgxPivotColumnResizingService } from './pivot-resizing.service';
import { IgxColumnResizerDirective } from '../resizer.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-grid-column-resizer',
    templateUrl: '../resizer.component.html',
    imports: [IgxColumnResizerDirective]
})
export class IgxPivotGridColumnResizerComponent extends IgxGridColumnResizerComponent {
    override colResizingService: IgxPivotColumnResizingService;

    constructor() {
        const colResizingService = inject(IgxPivotColumnResizingService);

        super(colResizingService);
    
        this.colResizingService = colResizingService;
    }
}
