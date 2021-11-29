import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IgxColumnResizingService } from './resizing.service';
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
