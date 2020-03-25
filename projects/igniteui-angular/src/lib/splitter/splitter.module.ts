import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxSplitBarComponent } from './splitbar/split-bar.component';
import { IgxSplitterPaneComponent } from './splitpane/split-pane.component';
import { IgxSplitterComponent } from './splitter.component';
import { SplitterDirective } from './splitter.directives';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        IgxSplitterComponent,
        IgxSplitterPaneComponent,
        IgxSplitBarComponent,
        SplitterDirective
    ],
    exports: [
        IgxSplitterComponent,
        IgxSplitterPaneComponent,
        IgxSplitBarComponent,
        SplitterDirective
    ]
})
export class IgxSplitterModule { }
