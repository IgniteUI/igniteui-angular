import { IgxSplitterPaneComponent } from './splitter-pane/splitter-pane.component';
import { IgxSplitBarComponent, IgxSplitterComponent } from './splitter.component';

export * from './splitter.component';
export * from './splitter-pane/splitter-pane.component';

/* NOTE: Splitter directives collection for ease-of-use import in standalone components scenario */
export const IGX_SPLITTER_DIRECTIVES = [
    IgxSplitterComponent,
    IgxSplitterPaneComponent,
    IgxSplitBarComponent
] as const;
