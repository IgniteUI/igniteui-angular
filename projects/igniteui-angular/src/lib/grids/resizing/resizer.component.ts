import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IgxColumnResizingService } from './resizing.service';
import { IgxColumnResizerDirective } from './resizer.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-column-resizer',
    templateUrl: './resizer.component.html'
})
export class IgxGridColumnResizerComponent {
    constructor(public colResizingService: IgxColumnResizingService) { }

    @ViewChild(IgxColumnResizerDirective, { static: true })
    public resizer: IgxColumnResizerDirective;
}
