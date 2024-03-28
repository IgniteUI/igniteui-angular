import { Component, ViewChild } from '@angular/core';
import { IgxSplitterComponent, IgxSplitterModule, SplitterType } from 'igniteui-angular';

@Component({
    selector: 'app-splitter-sample',
    styleUrls: ['splitter.sample.scss'],
    templateUrl: 'splitter.sample.html',
    standalone: true,
    imports: [IgxSplitterModule, IgxSplitterComponent]
})

export class SplitterSampleComponent {
    @ViewChild('splitter') public splitterComponent: IgxSplitterComponent;
    
    public typeHorizontal = SplitterType.Horizontal;
    public typeVertical = SplitterType.Vertical;

    public toggleCollapsible() {
        this.splitterComponent.nonCollapsible = !this.splitterComponent.nonCollapsible;
    }
}
