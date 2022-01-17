import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { IgxGridColumnResizerComponent } from '../resizer.component';
import { IgxPivotColumnResizingService } from './pivot-resizing.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-grid-column-resizer',
    templateUrl: '../resizer.component.html'
})
export class IgxPivotGridColumnResizerComponent extends IgxGridColumnResizerComponent {
    @HostBinding('style.top.px')
    public topPos = 0;

    @HostBinding('style.position')
    public pos = 'absolute';

    constructor(public colResizingService: IgxPivotColumnResizingService) {
        super(colResizingService);
    }
}
