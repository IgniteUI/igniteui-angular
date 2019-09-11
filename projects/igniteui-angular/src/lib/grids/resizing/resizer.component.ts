import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IgxColumnResizingService } from './resizing.service';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false,
    selector: 'igx-grid-column-resizer',
    templateUrl: './resizer.component.html'
})
export class IgxGridColumnResizerComponent {
    constructor(public readonly resizingService: IgxColumnResizingService) { }

    public resizeColumn(event) {
        this.resizingService.resizeColumn(event);
    }
}
