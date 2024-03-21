import { Component } from '@angular/core';
import { IgxSplitterModule, SplitterType } from 'igniteui-angular';

@Component({
    selector: 'app-splitter-sample',
    styleUrls: ['splitter.sample.scss'],
    templateUrl: 'splitter.sample.html',
    standalone: true,
    imports: [IgxSplitterModule]
})

export class SplitterSampleComponent {
    public typeHorizontal = SplitterType.Horizontal;
    public typeVertical = SplitterType.Vertical;
}
