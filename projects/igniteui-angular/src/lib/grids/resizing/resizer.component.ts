import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IgxColumnResizingService, IgxPivotColumnResizingService } from './resizing.service';
import { IgxColumnResizerDirective } from './resizer.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-column-resizer',
    templateUrl: './resizer.component.html'
})
export class IgxGridColumnResizerComponent {
    @ViewChild(IgxColumnResizerDirective, { static: true })
    public resizer: IgxColumnResizerDirective;

    constructor(public colResizingService: IgxColumnResizingService) { }
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-pivot-grid-column-resizer',
    templateUrl: './resizer.component.html'
})
export class IgxPivotGridColumnResizerComponent extends IgxGridColumnResizerComponent {
    constructor(public colResizingService: IgxPivotColumnResizingService) {
        super(colResizingService);
    }
}
