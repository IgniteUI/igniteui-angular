import { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
import { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
import { IgxExpansionPanelComponent } from './expansion-panel.component';
import { IgxExpansionPanelDescriptionDirective, IgxExpansionPanelIconDirective, IgxExpansionPanelTitleDirective } from './expansion-panel.directives';

export { IExpansionPanelEventArgs } from './expansion-panel.common';
export { IgxExpansionPanelHeaderComponent } from './expansion-panel-header.component';
export { IgxExpansionPanelBodyComponent } from './expansion-panel-body.component';
export { IgxExpansionPanelComponent } from './expansion-panel.component';
export {
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelIconDirective,
    IgxExpansionPanelTitleDirective
} from './expansion-panel.directives';
export { ExpansionPanelHeaderIconPosition } from './expansion-panel-header.component';

/* NOTE: Expansion panel directives collection for ease-of-use import in standalone components scenario */
export const IGX_EXPANSION_PANEL_DIRECTIVES = [
    IgxExpansionPanelComponent,
    IgxExpansionPanelHeaderComponent,
    IgxExpansionPanelBodyComponent,
    IgxExpansionPanelDescriptionDirective,
    IgxExpansionPanelTitleDirective,
    IgxExpansionPanelIconDirective
] as const;
