import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitBarComponent } from './splitbar/split-bar.component';
import { SplitPaneComponent } from './splitpane/split-pane.component';
import { SplitterComponent } from './splitter.component';
import { SplitterDirective } from './splitter.directives';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SplitterComponent,
        SplitPaneComponent,
        SplitBarComponent,
        SplitterDirective
    ],
    exports: [
        SplitterComponent,
        SplitPaneComponent,
        SplitBarComponent,
        SplitterDirective
    ]
})
export class SplitterModule { }
