import { ChangeDetectionStrategy, Component, Input, ViewChild, inject } from '@angular/core';
import { IgxColumnResizingService } from './resizing.service';
import { IgxColumnResizerDirective } from './resizer.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'igx-grid-column-resizer',
    templateUrl: './resizer.component.html',
    imports: [IgxColumnResizerDirective]
})
export class IgxGridColumnResizerComponent {
    colResizingService = inject(IgxColumnResizingService);

    @Input()
    public restrictResizerTop: number;

    @ViewChild(IgxColumnResizerDirective, { static: true })
    public resizer: IgxColumnResizerDirective;
}
