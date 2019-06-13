import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IgxColumnResizingService } from './grid-column-resizing.service';
import { IgxColumnResizerDirective } from './grid.common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-column-resizer',
    templateUrl: './grid-column-resizer.component.html'
})
export class IgxGridColumnResizerComponent {
    constructor(public colResizingService: IgxColumnResizingService) { }

    @ViewChild(IgxColumnResizerDirective, { static: true })
    public resizer: IgxColumnResizerDirective;
}
